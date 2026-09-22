import crypto from "crypto";

export const getPayUEndpoint = () => {
  const env = process.env.PAYU_ENV || "TEST";
  return env === "PRODUCTION"
    ? "https://api.payu.in/v2/payments"
    : "https://apitest.payu.in/v2/payments";
};

export const generatePayUHash = (data: string, salt: string) => {
  return crypto.createHash("sha512").update(data + salt).digest("hex");
};

/**
 * Generates the PayU checkout request parameters and endpoint URL for Hosted v2 / Non-Seamless API.
 */
export async function createPayUCheckout({
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  phone,
  surl,
  failureUrl,
  cancelUrl,
}: {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  surl: string;
  failureUrl: string;
  cancelUrl: string;
}) {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SECRET;

  if (!key || !salt) {
    throw new Error("PayU configuration missing");
  }

  // Standard PayU hash string formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
  const udf1 = "";
  const udf2 = "";
  const udf3 = "";
  const udf4 = "";
  const udf5 = "";
  
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  const baseUrl = process.env.PAYU_ENV === "PRODUCTION"
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";

  // For PayU non-seamless hosted checkout, we return the gateway form parameters & action URL,
  // or a server-generated redirect payload.
  return {
    gatewayUrl: baseUrl,
    params: {
      key,
      txnid,
      amount: amount.toFixed(2),
      productinfo,
      firstname,
      email,
      phone: phone || "9999999999",
      surl,
      furl: failureUrl,
      curl: cancelUrl,
      hash,
      service_provider: "payu_paisa"
    }
  };
}
