import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getPayUConfig,
  getPayUCheckoutUrl,
  getPayUConfigIssue,
  isPayUConfigured,
  PaymentConfigError
} from "@/services/payments/payuConfig";

const KEY = "JP***g";
const SALT = "abcdefghijklmnopqrst";
const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.PAYU_MERCHANT_KEY = KEY;
  process.env.PAYU_MERCHANT_SECRET = SALT;
  process.env.PAYU_ENV = "TEST";
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("PAYU_ENV resolution", () => {
  it("refuses to guess when PAYU_ENV is missing", () => {
    // The old default silently targeted test.payu.in with live credentials,
    // which PayU answers with an unexplained gateway error page.
    delete process.env.PAYU_ENV;
    expect(() => getPayUConfig()).toThrow(PaymentConfigError);
    expect(() => getPayUConfig()).toThrow(/PAYU_ENV/);
    expect(isPayUConfigured()).toBe(false);
  });

  it("rejects values that are neither TEST nor PRODUCTION", () => {
    process.env.PAYU_ENV = "live";
    expect(() => getPayUConfig()).toThrow(/TEST or PRODUCTION/);
    expect(isPayUConfigured()).toBe(false);
  });

  it("treats casing and surrounding whitespace as equivalent", () => {
    process.env.PAYU_ENV = "production";
    expect(getPayUConfig().isProduction).toBe(true);
    expect(getPayUCheckoutUrl()).toBe("https://secure.payu.in/_payment");

    process.env.PAYU_ENV = "  Production  ";
    expect(getPayUConfig().isProduction).toBe(true);

    process.env.PAYU_ENV = "test";
    expect(getPayUConfig().isProduction).toBe(false);
    expect(getPayUCheckoutUrl()).toBe("https://test.payu.in/_payment");
  });
});

describe("credential sanitising", () => {
  it("trims paste artifacts from the ends of credentials", () => {
    process.env.PAYU_MERCHANT_KEY = `  ${KEY}\n`;
    process.env.PAYU_MERCHANT_SECRET = `\t${SALT} `;
    const config = getPayUConfig();
    expect(config.key).toBe(KEY);
    expect(config.salt).toBe(SALT);
  });

  it("rejects quoted credentials, which would corrupt every hash", () => {
    process.env.PAYU_MERCHANT_SECRET = `"${SALT}"`;
    expect(() => getPayUConfig()).toThrow(/quote/);
    expect(isPayUConfigured()).toBe(false);
  });

  it("rejects credentials with interior whitespace", () => {
    process.env.PAYU_MERCHANT_KEY = "abc def";
    expect(() => getPayUConfig()).toThrow(/whitespace/);
    expect(isPayUConfigured()).toBe(false);
  });

  it("rejects an empty credential after trimming", () => {
    process.env.PAYU_MERCHANT_SECRET = "   ";
    expect(() => getPayUConfig()).toThrow(/empty/);
  });
});

describe("getPayUConfigIssue", () => {
  it("returns null when everything is configured", () => {
    expect(getPayUConfigIssue()).toBeNull();
  });

  it("explains the failure when credentials are absent", () => {
    delete process.env.PAYU_MERCHANT_KEY;
    expect(getPayUConfigIssue()).toMatch(/PAYU_MERCHANT_KEY/);
  });

  it("explains the failure when PAYU_ENV is unusable", () => {
    process.env.PAYU_ENV = "staging";
    expect(getPayUConfigIssue()).toMatch(/TEST or PRODUCTION/);
  });
});
