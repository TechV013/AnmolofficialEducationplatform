import crypto from "crypto";
import { getPayUConfig, getPayUCheckoutUrl } from "./payuConfig";

function sha512(value: string): string {
  return crypto.createHash("sha512").update(value, "utf8").digest("hex");
}

/**
 * Forward hash for a checkout request.
 *
 * Per PayU's documented formula the five user-defined fields are always present
 * as empty strings when unused, so the pipe count between `email` and the salt
 * never changes:
 *   sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayUHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}, salt: string): string {
  const { key, txnid, amount, productinfo, firstname, email } = params;
  const udf = [params.udf1 ?? "", params.udf2 ?? "", params.udf3 ?? "", params.udf4 ?? "", params.udf5 ?? ""];
  return sha512([key, txnid, amount, productinfo, firstname, email, ...udf].join("|") + "||||||" + salt);
}

/**
 * Reverse hash for validating a PayU callback or webhook postback.
 *
 *   regular:                sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 *   with additional charges: sha512(additional_charges|SALT|status||||||udf5|...|key)
 *   with split info:        sha512(SALT|status|splitInfo||||||udf5|...|key)
 *
 * The six literal pipes between status (or splitInfo) and udf5 are part of the
 * documented formula — PayU's internal empty fields — and this exact shape was
 * verified byte-for-byte against the sample callback hash published in PayU's
 * own integration docs. Omitting them makes every valid signature fail.
 *
 * Returned unchanged so the caller can compare it against the posted hash with
 * a constant-time check.
 */
export function generatePayUResponseHash(
  postback: Record<string, unknown>,
  salt: string,
  key: string
): string {
  const str = (v: unknown) => (v == null ? "" : String(v));
  const additionalCharges = str(postback.additional_charges ?? postback.additionalCharges);
  const splitInfo = str(postback.splitInfo ?? postback.split_info);

  const head = [salt, str(postback.status)];
  if (splitInfo) head.push(splitInfo);

  const tail = [
    str(postback.udf5),
    str(postback.udf4),
    str(postback.udf3),
    str(postback.udf2),
    str(postback.udf1),
    str(postback.email),
    str(postback.firstname),
    str(postback.productinfo),
    str(postback.amount),
    str(postback.txnid),
    key
  ].join("|");

  const hashString = head.join("|") + "||||||" + tail;
  return sha512(additionalCharges ? `${additionalCharges}|${hashString}` : hashString);
}

/**
 * PayU posts `amount` back as a decimal string such as "999.00". Normalising it
 * to paise avoids floating point drift when comparing against the stored order.
 */
export function parseAmountToPaise(amount: unknown): number | null {
  const value = String(amount ?? "").trim();
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 100);
}

export interface PayUCheckoutInput {
  txnid: string;
  /** Amount in major currency units (rupees), not paise. */
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string | null;
  surl: string;
  failureUrl: string;
  cancelUrl: string;
}

/**
 * Builds the hosted checkout payload. PayU's hosted form requires a form POST to
 * `/_payment` carrying these fields plus the hash; the merchant salt is never
 * included.
 */
export function createPayUCheckout(input: PayUCheckoutInput) {
  const { key, salt } = getPayUConfig();

  // Two decimal places is required: PayU treats the string as the charge amount,
  // and the same string feeds the forward hash.
  const amount = input.amount.toFixed(2);

  const hash = generatePayUHash(
    {
      key,
      txnid: input.txnid,
      amount,
      productinfo: input.productinfo,
      firstname: input.firstname,
      email: input.email
    },
    salt
  );

  const params: Record<string, string> = {
    key,
    txnid: input.txnid,
    amount,
    currency: "INR",
    productinfo: input.productinfo,
    firstname: input.firstname,
    email: input.email,
    surl: input.surl,
    furl: input.failureUrl,
    curl: input.cancelUrl,
    hash,
    service_provider: "payu_paisa"
  };

  // PayU treats phone as optional, but it is used for fraud checks. Placeholder
  // patterns such as all-identical digits are rejected outright, since sending
  // them invites a decline or a manual review.
  const digits = input.phone?.replace(/[\s-]/g, "") ?? "";
  const isRepeatedDigit = digits.length > 1 && /^(\d)\1+$/.test(digits);
  if (input.phone && /^\+?\d{6,15}$/.test(digits) && !isRepeatedDigit) {
    params.phone = input.phone;
  }

  return { gatewayUrl: getPayUCheckoutUrl(), params };
}