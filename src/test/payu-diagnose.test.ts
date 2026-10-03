import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/payu/diagnose/route";

const KEY = "JP***g";
const SALT = "abcdefghijklmnopqrst";
const TOKEN = "test-diagnose-token";
const originalEnv = { ...process.env };

function request(token?: string): NextRequest {
  const headers = new Headers();
  if (token !== undefined) headers.set("x-diagnose-token", token);
  return new NextRequest("https://www.anmolofficial.com/api/payu/diagnose", { headers });
}

function jsonResponse(body: unknown, status = 200) {
  return { status, text: async () => JSON.stringify(body) };
}

function htmlResponse(html: string, status = 200) {
  return { status, text: async () => html };
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchMock);
  process.env.PAYU_MERCHANT_KEY = KEY;
  process.env.PAYU_MERCHANT_SECRET = SALT;
  process.env.PAYU_ENV = "TEST";
  process.env.PAYU_DIAGNOSE_TOKEN = TOKEN;
  fetchMock.mockResolvedValue(jsonResponse({ status: 1, msg: "Transaction not found" }));
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
    expect(body.sections.config.key).toEqual({ length: KEY.length, hasWhitespace: false, hasQuote: false, nonAlphanumeric: 3 });
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

  it("classifies a verify_payment key rejection", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 0, msg: "Invalid key" }));
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.verifyPayment.ok).toBe(false);
    expect(body.sections.verifyPayment.classification).toBe("invalid-key");
  });

  it("treats an unknown transaction id as proof the credentials work", async () => {
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.verifyPayment.ok).toBe(true);
    expect(body.sections.verifyPayment.classification).toBe("unknown-transaction");
  });

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
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 1, msg: "Transaction not found" }));
    fetchMock.mockResolvedValueOnce(
      htmlResponse("<html>Choose a payment option: UPI, Cards</html>")
    );
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.ok).toBe(true);
    const [, init] = fetchMock.mock.calls[1];
    expect(String(init.body)).toContain(`key=${KEY}`);
    expect(String(init.body)).toContain("hash=");
    expect(String(init.body)).not.toContain(SALT);
  });

  it("flags PayU's generic gateway error page", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 1, msg: "ok" }));
    fetchMock.mockResolvedValueOnce(htmlResponse("<html>Pardon, Some Problem Occurred</html>"));
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.ok).toBe(false);
    expect(body.sections.checkout.reason).toBe("gateway-error-page");
  });

  it("flags a hash rejection on the checkout page", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ status: 1, msg: "ok" }));
    fetchMock.mockResolvedValueOnce(htmlResponse("<html>Invalid Hash</html>"));
    const body = await (await GET(request(TOKEN))).json();
    expect(body.sections.checkout.reason).toBe("invalid-hash");
  });
});
