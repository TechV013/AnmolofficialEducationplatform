import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "crypto";
import {
  generatePayUHash,
  generatePayUResponseHash,
  parseAmountToPaise,
  createPayUCheckout
} from "@/services/payments/payu.service";
import { getPayUConfig, getPayUCheckoutUrl, isPayUConfigured, PaymentConfigError } from "@/services/payments/payuConfig";

const KEY = "JP***g";
const SALT = "abcdefghijklmnopqrst";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.PAYU_MERCHANT_KEY = KEY;
  process.env.PAYU_MERCHANT_SECRET = SALT;
  process.env.PAYU_ENV = "TEST";
  process.env.NEXTAUTH_URL = "http://localhost:3000";
});

afterEach(() => {
  process.env = { ...originalEnv };
});

/** Independent reference implementation, written directly from PayU's docs. */
function referenceHash(parts: string[], salt: string): string {
  return crypto.createHash("sha512").update(parts.join("|") + "||||||" + salt, "utf8").digest("hex");
}

describe("payu config", () => {
  it("reports unconfigured when credentials are absent", () => {
    delete process.env.PAYU_MERCHANT_KEY;
    delete process.env.PAYU_MERCHANT_SECRET;
    expect(isPayUConfigured()).toBe(false);
    expect(() => getPayUConfig()).toThrow(PaymentConfigError);
  });

  it("routes to the sandbox endpoint in TEST and live in PRODUCTION", () => {
    expect(getPayUCheckoutUrl()).toBe("https://test.payu.in/_payment");
    process.env.PAYU_ENV = "PRODUCTION";
    expect(getPayUCheckoutUrl()).toBe("https://secure.payu.in/_payment");
  });
});

describe("forward hash", () => {
  it("matches PayU's documented formula when no udf fields are used", () => {
    const params = {
      key: KEY,
      txnid: "123456789",
      amount: "10.00",
      productinfo: "Test Product",
      firstname: "John",
      email: "john@example.com"
    };
    const expected = referenceHash(
      [KEY, "123456789", "10.00", "Test Product", "John", "john@example.com", "", "", "", "", ""],
      SALT
    );
    expect(generatePayUHash(params, SALT)).toBe(expected);
  });

  it("keeps every separator between the last udf and the salt", () => {
    // With empty udfs the documented formula collapses to 11 pipes between the
    // email and the salt: 5 udf separators plus the 6 literal ones. A short or
    // long run here produces a hash PayU will reject.
    const hash = generatePayUHash(
      { key: KEY, txnid: "t1", amount: "10.00", productinfo: "P", firstname: "J", email: "j@e.com" },
      SALT
    );
    const recomputed = crypto
      .createHash("sha512")
      .update(`${KEY}|t1|10.00|P|J|j@e.com|||||||||||${SALT}`, "utf8")
      .digest("hex");
    expect(hash).toBe(recomputed);
  });

  it("includes udf values when supplied", () => {
    const params = {
      key: KEY,
      txnid: "t1",
      amount: "10.00",
      productinfo: "P",
      firstname: "J",
      email: "j@e.com",
      udf2: "abc",
      udf4: "15"
    };
    const expected = referenceHash(
      [KEY, "t1", "10.00", "P", "J", "j@e.com", "", "abc", "", "15", ""],
      SALT
    );
    expect(generatePayUHash(params, SALT)).toBe(expected);
  });

  it("changes when any hashed field changes", () => {
    const base = { key: KEY, txnid: "t1", amount: "10.00", productinfo: "P", firstname: "J", email: "j@e.com" };
    const original = generatePayUHash(base, SALT);
    expect(generatePayUHash({ ...base, amount: "10.01" }, SALT)).not.toBe(original);
    expect(generatePayUHash({ ...base, txnid: "t2" }, SALT)).not.toBe(original);
    expect(generatePayUHash(base, "different-salt")).not.toBe(original);
  });
});

describe("reverse hash", () => {
  const postback = {
    status: "success",
    email: "john@example.com",
    firstname: "John",
    productinfo: "Test Product",
    amount: "10.00",
    txnid: "123456789"
  };

  /** PayU's documented literal: SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|... */
  function documentedReverseHash(
    parts: { status: string; udfs: string[]; rest: string[] },
    salt: string
  ): string {
    return crypto
      .createHash("sha512")
      .update(
        `${salt}|${parts.status}||||||${[...parts.udfs, ...parts.rest].join("|")}`,
        "utf8"
      )
      .digest("hex");
  }

  it("matches PayU's documented response formula", () => {
    const expected = documentedReverseHash(
      {
        status: "success",
        udfs: ["", "", "", "", ""],
        rest: ["john@example.com", "John", "Test Product", "10.00", "123456789", KEY]
      },
      SALT
    );
    expect(generatePayUResponseHash(postback, SALT, KEY)).toBe(expected);
  });

  it("matches the sample callback hash published in PayU's docs", () => {
    // PayU's own published sample response, with the test credentials PayU
    // ships in its documentation. Ground truth for the literal pipe shape:
    // if the six pipes between status and udf5 go missing, this fails.
    const sample = {
      status: "success",
      key: "PRiQvJ",
      txnid: "756609e32e92add4b5f2",
      amount: "10.00",
      productinfo: "Product Info",
      firstname: "Payu-Admin",
      email: "test@example.com",
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: ""
    };
    const expectedHash =
      "79d14afc4a3998a627d8fb431b2ee648b16fd6e31252397109ad5f44d77f7630daaaeedf0bbd5b3e7a81342c96bc087beb43125c0619cac1e5408243fdc29a04";
    expect(
      generatePayUResponseHash(sample, "mGHSxpD2iBVywParGQrGBlaXjnwkGJMQ", "PRiQvJ")
    ).toBe(expectedHash);
  });

  it("keeps the literal six pipes between status and the udf block", () => {
    const hash = generatePayUResponseHash(postback, SALT, KEY);
    const recomputed = crypto
      .createHash("sha512")
      .update(
        `${SALT}|success|||||||||||john@example.com|John|Test Product|10.00|123456789|${KEY}`,
        "utf8"
      )
      .digest("hex");
    expect(hash).toBe(recomputed);
  });

  it("places echoed udf values after the literal pipes", () => {
    // PayU echoes the same udf values back, so verifying a real callback means
    // recomputing the reverse hash from the posted fields.
    const udf = { udf1: "", udf2: "abc", udf3: "", udf4: "15", udf5: "" };
    const computed = generatePayUResponseHash({ ...postback, ...udf }, SALT, KEY);
    const expected = documentedReverseHash(
      {
        status: "success",
        udfs: ["", "15", "", "abc", ""],
        rest: ["john@example.com", "John", "Test Product", "10.00", "123456789", KEY]
      },
      SALT
    );
    expect(computed).toBe(expected);
  });

  it("treats missing fields as empty rather than the string undefined", () => {
    const withGaps = generatePayUResponseHash({ status: "success", txnid: "t" }, SALT, KEY);
    const expected = documentedReverseHash(
      { status: "success", udfs: ["", "", "", "", ""], rest: ["", "", "", "", "t", KEY] },
      SALT
    );
    expect(withGaps).toBe(expected);
    expect(withGaps).not.toContain("undefined");
  });

  it("prefixes additional_charges when PayU posts it", () => {
    // Payment modes that pass the gateway fee to the customer include
    // additional_charges, and the documented formula then prepends it.
    const postback2 = { ...postback, additional_charges: "1.18" };
    const expected = crypto
      .createHash("sha512")
      .update(
        `1.18|${SALT}|success|||||||||||john@example.com|John|Test Product|10.00|123456789|${KEY}`,
        "utf8"
      )
      .digest("hex");
    expect(generatePayUResponseHash(postback2, SALT, KEY)).toBe(expected);
  });

  it("does not prefix an empty additional_charges value", () => {
    const postback2 = { ...postback, additional_charges: "" };
    expect(generatePayUResponseHash(postback2, SALT, KEY)).toBe(
      generatePayUResponseHash(postback, SALT, KEY)
    );
  });

  it("includes splitInfo between status and the pipes when posted", () => {
    const postback2 = { ...postback, splitInfo: "split-json" };
    const expected = crypto
      .createHash("sha512")
      .update(
        `${SALT}|success|split-json|||||||||||john@example.com|John|Test Product|10.00|123456789|${KEY}`,
        "utf8"
      )
      .digest("hex");
    expect(generatePayUResponseHash(postback2, SALT, KEY)).toBe(expected);
  });
});

describe("parseAmountToPaise", () => {
  it("converts a PayU decimal string without floating point drift", () => {
    expect(parseAmountToPaise("999.00")).toBe(99900);
    expect(parseAmountToPaise("0.01")).toBe(1);
    expect(parseAmountToPaise("1090.33")).toBe(109033);
    expect(parseAmountToPaise(999)).toBe(99900);
  });

  it("returns null for unusable values", () => {
    expect(parseAmountToPaise("")).toBeNull();
    expect(parseAmountToPaise("abc")).toBeNull();
    expect(parseAmountToPaise(undefined)).toBeNull();
  });
});

describe("createPayUCheckout", () => {
  const base = {
    txnid: "PAYU_1_abc",
    amount: 999,
    productinfo: "React Course",
    firstname: "Asha",
    email: "asha@example.com",
    surl: "http://localhost:3000/api/payu/callback",
    failureUrl: "http://localhost:3000/courses/c1?payment=fail",
    cancelUrl: "http://localhost:3000/courses/c1?payment=cancel"
  };

  it("sends the amount in rupees, not paise", () => {
    // A 999 rupee course must not be presented to PayU as 99900.
    const { params } = createPayUCheckout({ ...base, amount: 999 });
    expect(params.amount).toBe("999.00");
  });

  it("formats the amount to two decimals as PayU requires", () => {
    expect(createPayUCheckout({ ...base, amount: 10 }).params.amount).toBe("10.00");
    expect(createPayUCheckout({ ...base, amount: 10.5 }).params.amount).toBe("10.50");
  });

  it("signs the exact amount string that is sent", () => {
    const { params } = createPayUCheckout({ ...base, amount: 1090.33 });
    expect(params.hash).toBe(
      generatePayUHash(
        {
          key: KEY,
          txnid: base.txnid,
          amount: "1090.33",
          productinfo: base.productinfo,
          firstname: base.firstname,
          email: base.email
        },
        SALT
      )
    );
  });

  it("never exposes the merchant salt", () => {
    const { params } = createPayUCheckout(base);
    expect(Object.values(params)).not.toContain(SALT);
  });

  it("omits phone unless a plausible number is supplied", () => {
    expect(createPayUCheckout(base).params.phone).toBeUndefined();
    expect(createPayUCheckout({ ...base, phone: null }).params.phone).toBeUndefined();
    expect(createPayUCheckout({ ...base, phone: "9999999999" }).params.phone).toBeUndefined();
    expect(createPayUCheckout({ ...base, phone: "not-a-number" }).params.phone).toBeUndefined();
  });

  it("includes a real phone number when the student has one", () => {
    expect(createPayUCheckout({ ...base, phone: "+919876543210" }).params.phone).toBe("+919876543210");
    expect(createPayUCheckout({ ...base, phone: "98765 43210" }).params.phone).toBe("98765 43210");
  });

  it("targets the endpoint matching PAYU_ENV", () => {
    expect(createPayUCheckout(base).gatewayUrl).toBe("https://test.payu.in/_payment");
    process.env.PAYU_ENV = "PRODUCTION";
    expect(createPayUCheckout(base).gatewayUrl).toBe("https://secure.payu.in/_payment");
  });

  it("includes the fields PayU requires", () => {
    const { params } = createPayUCheckout(base);
    for (const field of ["key", "txnid", "amount", "productinfo", "firstname", "email", "surl", "furl", "curl", "hash"]) {
      expect(params[field], `missing ${field}`).toBeTruthy();
    }
  });
});