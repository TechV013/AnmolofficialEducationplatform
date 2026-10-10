import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/payu/diagnose/route";

const KEY = "JP***g";
const SALT = "abcdefghijklmnopqrst";
const TOKEN = "test-diagnose-token";
const originalEnv = { ...process.env };

const INVALID_HASH = { status: 0, msg: "Invalid Hash." };
const UNKNOWN_TXN = { status: 0, msg: "Invalid transaction id" };

function request(token?: string): NextRequest {
  const headers = new Headers();
  if (token !== undefined) headers.set("x-diagnose-token", token);
  return new NextRequest("https://www.anmolofficial.com/api/payu/diagnose", { headers });
}

function jsonResponse(body: unknown, status = 200) {
  return {
    status,
    headers: { get: () => null },
    text: async () => JSON.stringify(body)
  };
}

function htmlResponse(html: string, status = 200) {
  return {
    status,
    headers: { get: () => null },
    text: async () => html
  };
}

function redirectResponse(location: string, status = 302) {
  return {
    status,
    headers: { get: (h: string) => (h === "location" ? location : null) },
    text: async () => ""
  };
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  process.env.PAYU_MERCHANT_KEY = KEY;
  process.env.PAYU_MERCHANT_SECRET = SALT;
  process.env.PAYU_ENV = "TEST";
  process.env.PAYU_DIAGNOSE_TOKEN = TOKEN;
  // Default: PayU rejects the credentials on both endpoints.
  fetchMock.mockResolvedValue(jsonResponse(INVALID_HASH));
});

afterEach(() => {
  process.env = { ...originalEnv };
  vi.unstubAllGlobals();
});

describe("diagnose route access control", () => {
  it("is a 404 when the token env var is not configured", async () => {
    delete process.env.PAYU_DIAGNOSE_TOKEN;
    const res = await GET(request(TOKEN));
    expect(res.status).toBe(404);
  });

  it("is a 404 without the header", async () => {
    const res = await GET(request());
    expect(res.status).toBe(404);
  });

  it("is a 404 with a wrong token", async () => {
    const res = await GET(request("wrong"));
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers with the report for the right token", async () => {
    const res = await GET(request(TOKEN));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sections.config.ok).toBe(true);
    expect(body.sections.config.env).toBe("TEST");
  });
});

describe("diagnose report content", () => {
  it("never leaks the key or salt", async () => {
    // PayU error echoes can contain the credential; it must be scrubbed.
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ status: 0, msg: `Invalid hash for key ${KEY} salt ${SALT}` })
    );
    const res = await GET(request(TOKEN));
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain(KEY);
    expect(text).not.toContain(SALT);
    expect(text).toContain("[redacted]");
  });

  it("reports credential shape without values", async () => {
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.config.key).toEqual({
      length: KEY.length,
      hasWhitespace: false,
      hasQuote: false,
      nonAlphanumeric: 3
    });
    expect(JSON.stringify(body.sections.config)).not.toContain(KEY);
  });

  it("stops early with the config error when PAYU_ENV is unusable", async () => {
    process.env.PAYU_ENV = "staging";
    const res = await GET(request(TOKEN));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sections.config.ok).toBe(false);
    expect(body.sections.config.error).toMatch(/TEST or PRODUCTION/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("verify_payment verdicts", () => {
  it("calls credentials valid for the configured environment", async () => {
    // First probe (test endpoint) accepts the key; production rejects it.
    fetchMock.mockResolvedValueOnce(jsonResponse(UNKNOWN_TXN));
    const body = await (await GET(request(TOKEN))).json();
    const verify = body.sections.verifyPayment;
    expect(verify.ok).toBe(true);
    expect(verify.verdict).toBe("credentials-match-configured-environment");
    expect(verify.byEndpoint.test.classification).toBe("unknown-transaction");
    expect(fetchMock).toHaveBeenCalledTimes(3); // two verifies + checkout probe
  });

  it("detects production credentials while PAYU_ENV is TEST", async () => {
    // Test endpoint rejects; production endpoint accepts.
    fetchMock.mockResolvedValueOnce(jsonResponse(INVALID_HASH));
    fetchMock.mockResolvedValueOnce(jsonResponse(UNKNOWN_TXN));
    const body = await (await GET(request(TOKEN))).json();
    const verify = body.sections.verifyPayment;
    expect(verify.ok).toBe(false);
    expect(verify.verdict).toMatch(/^wrong-environment/);
    expect(verify.byEndpoint.production.ok).toBe(true);
  });

  it("reports a key/salt pair that neither environment accepts", async () => {
    const body = await (await GET(request(TOKEN))).json();
    const verify = body.sections.verifyPayment;
    expect(verify.ok).toBe(false);
    expect(verify.verdict).toMatch(/invalid-key-or-salt/);
    expect(verify.byEndpoint.test.classification).toBe("invalid-hash");
    expect(verify.byEndpoint.production.classification).toBe("invalid-hash");
  });

  it("parses the PHP-array response shape PayU sometimes returns", async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      text: async () => "<pre>Array\n(\n\t[status] => 0\n\t[msg] => Invalid Hash.\n)\n</pre>"
    });
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.verifyPayment.byEndpoint.test.classification).toBe("invalid-hash");
    expect(body.sections.verifyPayment.byEndpoint.test.payuStatus).toBe(0);
  });
});

describe("checkout probe", () => {
  it("skips the checkout probe in PRODUCTION", async () => {
    process.env.PAYU_ENV = "PRODUCTION";
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.skipped).toBeTruthy();
    const checkoutCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("_payment")
    );
    expect(checkoutCalls).toHaveLength(0);
  });

  it("posts a signed payload to the test endpoint and reads the verdict", async () => {
    const paymentPage = htmlResponse("<html>Choose a payment option: UPI, Cards</html>");
    // Order: test verify, production verify, then the checkout probe.
    fetchMock
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(paymentPage);
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.ok).toBe(true);
    const checkoutCall = fetchMock.mock.calls.find(([url]) => String(url).includes("_payment"));
    expect(checkoutCall).toBeTruthy();
    const init = checkoutCall![1];
    expect(String(init.body)).toContain(`key=${KEY}`);
    expect(String(init.body)).toContain("hash=");
    expect(String(init.body)).not.toContain(SALT);
  });

  it("treats a redirect to PayU's payment page as a successful render", async () => {
    // Valid credentials are answered with 302 to apitest.payu.in, which the
    // probe must recognise without following the redirect.
    fetchMock
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(
        redirectResponse("https://apitest.payu.in/public/#/2b07576f91a9")
      );
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.ok).toBe(true);
    expect(body.sections.checkout.reason).toBe("payment-page-redirect");
    expect(body.sections.checkout.redirectedTo).toBe("apitest.payu.in");
  });

  it("flags PayU's generic gateway error page", async () => {
    fetchMock
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(htmlResponse("<html>Pardon, Some Problem Occurred</html>"));
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.ok).toBe(false);
    expect(body.sections.checkout.reason).toBe("gateway-error-page");
  });

  it("flags a hash rejection on the checkout page", async () => {
    fetchMock
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(htmlResponse("<html>Invalid Hash</html>"));
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.reason).toBe("invalid-hash");
  });

  it("surfaces the error detail from the page's pre block", async () => {
    fetchMock
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(htmlResponse("<html><pre>Invalid Hash: merchant key rejected</pre></html>"));
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.errorDetail).toContain("Invalid Hash");
    expect(body.sections.checkout.errorDetail).not.toContain(KEY);
  });

  it("returns the posted field names and a scrubbed page excerpt on failure", async () => {
    const page = htmlResponse(
      `<html><body>expected ${KEY}|txnid|1.00|x|y|z||||||${SALT} rejected</body></html>`
    );
    fetchMock
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(page);
    const body = await (await GET(request(TOKEN))).json();
    const checkout = body.sections.checkout;
    // The excerpt carries PayU's expected hash string so the pipe count can be
    // read off, but the credentials themselves must never leave the server.
    expect(checkout.postedFields).toContain("udf1");
    expect(checkout.postedFields).toContain("hash");
    expect(checkout.htmlExcerpt).toContain("expected");
    expect(checkout.htmlExcerpt).toContain("[redacted]");
    expect(checkout.htmlExcerpt).not.toContain(KEY);
    expect(checkout.htmlExcerpt).not.toContain(SALT);
    expect(JSON.stringify(body)).not.toContain(SALT);
  });

  it("omits the excerpt when the checkout probe succeeds", async () => {
    fetchMock
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(INVALID_HASH)
      .mockResolvedValueOnce(htmlResponse("<html>Choose a payment option: UPI, Cards</html>"));
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.ok).toBe(true);
    expect(body.sections.checkout.htmlExcerpt).toBeUndefined();
    expect(body.sections.checkout.postedFields).toBeUndefined();
  });
});
