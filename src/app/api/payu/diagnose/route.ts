import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createPayUCheckout } from "@/services/payments/payu.service";
import { getPayUConfig, getPayUCheckoutUrl } from "@/services/payments/payuConfig";

export const dynamic = "force-dynamic";

/**
 * Operational self-check for the PayU integration. Runs entirely inside the
 * deployment so merchant credentials never reach the client, and returns only
 * shapes/lengths/classifications — never the key or salt themselves.
 *
 * Gated by PAYU_DIAGNOSE_TOKEN (404 when unset) via the x-diagnose-token
 * header. Read-only: verify_payment is a query API, and the checkout probe
 * only renders a page on PayU's test endpoint.
 */

type CheckSection = Record<string, unknown>;

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Removes credentials from any text before it leaves the server. */
function scrub(text: string, secrets: string[]): string {
  let out = text;
  for (const secret of secrets) {
    if (secret) out = out.split(secret).join("[redacted]");
  }
  return out;
}

function sha512(value: string): string {
  return crypto.createHash("sha512").update(value, "utf8").digest("hex");
}

function charsetReport(value: string): CheckSection {
  return {
    length: value.length,
    hasWhitespace: /\s/.test(value),
    hasQuote: /["']/.test(value),
    nonAlphanumeric: (value.match(/[^A-Za-z0-9]/g) ?? []).length
  };
}

function classifyVerifyMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("key")) return "invalid-key";
  if (lower.includes("hash")) return "invalid-hash";
  if (lower.includes("txnid") || lower.includes("transaction")) return "unknown-transaction";
  return "other";
}

function classifyCheckoutHtml(html: string): { ok: boolean; reason: string | null } {
  const errorMarkers: Array<[RegExp, string]> = [
    [/pardon,?\s*some problem occurred/i, "gateway-error-page"],
    [/mandatory parameter/i, "missing-parameter"],
    [/invalid\s*hash/i, "invalid-hash"],
    [/invalid\s*(merchant\s*)?key/i, "invalid-key"],
    [/invalid\s*amount/i, "invalid-amount"],
    [/invalid\s*(currency|productinfo|firstname|email|txnid)/i, "invalid-field"]
  ];
  for (const [pattern, reason] of errorMarkers) {
    if (pattern.test(html)) return { ok: false, reason };
  }
  // A rendered checkout page offers at least one payment method.
  const looksLikePaymentPage =
    /payment\s*option/i.test(html) || /upi/i.test(html) || /card/i.test(html);
  return looksLikePaymentPage
    ? { ok: true, reason: null }
    : { ok: false, reason: "unrecognised-response" };
}

function checkConfig(): CheckSection {
  try {
    const config = getPayUConfig();
    return {
      ok: true,
      env: config.isProduction ? "PRODUCTION" : "TEST",
      endpoint: getPayUCheckoutUrl(),
      key: charsetReport(config.key),
      salt: charsetReport(config.salt)
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown config error" };
  }
}

/**
 * PayU answers with JSON or with a PHP-printed array depending on the endpoint.
 * Extract status/msg from either shape.
 */
function parsePayUResponse(raw: string): { status?: number; msg?: string } | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
    // fall through to the PHP-array shape
  }
  const statusMatch = raw.match(/\[status\]\s*=>\s*(-?\d+)/);
  const msgMatch = raw.match(/\[msg\]\s*=>\s*([^\r\n<]+)/);
  if (statusMatch || msgMatch) {
    return {
      status: statusMatch ? Number(statusMatch[1]) : undefined,
      msg: msgMatch ? msgMatch[1].trim() : ""
    };
  }
  return null;
}

type VerifyResult = {
  ok: boolean;
  httpStatus: number;
  payuStatus: number | null;
  classification: string | null;
  message: string;
};

async function probeVerify(
  base: string,
  key: string,
  salt: string,
  var1: string,
  secrets: string[]
): Promise<VerifyResult> {
  const hash = sha512([key, "verify_payment", var1, salt].join("|"));
  try {
    const res = await fetch(`${base}/merchant/postservice?form=2`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key,
        command: "verify_payment",
        var1,
        hash
      }).toString(),
      signal: AbortSignal.timeout(20000)
    });
    const raw = (await res.text()).slice(0, 2000);
    const parsed = parsePayUResponse(raw);
    const msg = parsed?.msg ?? "";
    const classification = msg ? classifyVerifyMessage(msg) : null;
    return {
      // status 1 = API healthy. status 0 with an unknown txnid still proves the
      // key and hash were accepted — only a key/hash complaint is a failure.
      ok:
        parsed?.status === 1 ||
        (parsed?.status === 0 && classification === "unknown-transaction"),
      httpStatus: res.status,
      payuStatus: parsed?.status ?? null,
      classification,
      message: scrub(msg || raw.slice(0, 300), secrets)
    };
  } catch (e) {
    return {
      ok: false,
      httpStatus: 0,
      payuStatus: null,
      classification: "request-failed",
      message: e instanceof Error ? e.message : "request failed"
    };
  }
}

/**
 * Probe verify_payment against BOTH PayU environments (read-only query, never
 * moves money). PayU keys are environment-specific, so the pattern of results
 * discriminates the three failure modes: correct env, wrong env, or a key/salt
 * pair that matches neither.
 */
async function checkVerifyPayment(secrets: string[]): Promise<CheckSection> {
  const config = getPayUConfig();
  const var1 = `DIAG${Date.now().toString(36).toUpperCase()}`;

  const [test, production] = await Promise.all([
    probeVerify("https://test.payu.in", config.key, config.salt, var1, secrets),
    probeVerify("https://secure.payu.in", config.key, config.salt, var1, secrets)
  ]);

  const configured = config.isProduction ? production : test;
  const other = config.isProduction ? test : production;

  let verdict: string;
  if (configured.ok && !other.ok) {
    verdict = "credentials-match-configured-environment";
  } else if (!configured.ok && other.ok) {
    verdict = `wrong-environment: credentials are valid on ${
      other === test ? "test" : "production"
    } but PAYU_ENV selects ${config.isProduction ? "PRODUCTION" : "TEST"}`;
  } else if (!configured.ok && !other.ok) {
    verdict = "invalid-key-or-salt: rejected by both environments";
  } else {
    verdict = "both-environments-accepted (unexpected)";
  }

  return {
    ok: configured.ok,
    verdict,
    byEndpoint: { test, production }
  };
}

/**
 * Pull the first transaction record out of either response shape PayU uses:
 * the JSON `transaction_details` array, or the PHP print_r fallback where each
 * field appears as `[name] => value` inside the nested transaction block.
 * Returns null when neither shape yields a txnid.
 */
function extractTxnRecord(raw: string, parsed: { status?: number; msg?: string } | null): Record<string, unknown> | null {
  const keep = [
    "txnid", "mihpayid", "status", "unmappedstatus", "mode", "error",
    "amount", "currency", "addedon", "payment_source", "bank_msg", "bank_ref_num"
  ];
  if (parsed && typeof parsed === "object" && Array.isArray((parsed as { transaction_details?: unknown }).transaction_details)) {
    const first = (parsed as { transaction_details: Record<string, unknown>[] }).transaction_details[0];
    if (first && typeof first === "object") {
      const record: Record<string, unknown> = {};
      for (const field of keep) {
        if (first[field] !== undefined) record[field] = first[field];
      }
      return Object.keys(record).length > 0 ? record : null;
    }
  }
  // PHP print_r shape: only trust fields AFTER the transaction_details marker so
  // the top-level [status] => 1 is not confused with the record's status.
  const marker = raw.search(/\[transaction_details\]/i);
  if (marker >= 0) {
    const block = raw.slice(marker);
    const record: Record<string, unknown> = {};
    for (const field of keep) {
      const match = block.match(new RegExp(`\\[${field}\\]\\s*=>\\s*([^\\r\\n<]+)`));
      if (match) record[field] = match[1].trim();
    }
    return Object.keys(record).length > 0 ? record : null;
  }
  return null;
}

/**
 * Look up a real transaction on PayU's verify_payment API. Only the configured
 * environment is queried (both endpoints previously tripped PayU's per-merchant
 * request limit). The response carries the full transaction record, so only a
 * whitelist of operational fields is returned and everything is scrubbed.
 */
async function checkTransaction(txnid: string, secrets: string[]): Promise<CheckSection> {
  const config = getPayUConfig();
  const base = config.isProduction ? "https://secure.payu.in" : "https://test.payu.in";
  const hash = sha512([config.key, "verify_payment", txnid, config.salt].join("|"));
  try {
    const res = await fetch(`${base}/merchant/postservice?form=2`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key: config.key,
        command: "verify_payment",
        var1: txnid,
        hash
      }).toString(),
      signal: AbortSignal.timeout(20000)
    });
    const raw = (await res.text()).slice(0, 8000);
    const parsed = parsePayUResponse(raw);
    const msg = parsed?.msg ?? "";
    const record = extractTxnRecord(raw, parsed);

    // "N out of N Transactions Fetched Successfully" with N > 0 means found;
    // "0 out of ..." means the txnid does not exist on this environment.
    const fetchedMatch = msg.match(/(\d+)\s+out of\s+\d+/i);
    const fetchedCount = fetchedMatch ? Number(fetchedMatch[1]) : null;
    let classification: string;
    if (record || (fetchedCount !== null && fetchedCount > 0)) {
      classification = "transaction-found";
    } else if (fetchedCount === 0) {
      classification = "unknown-transaction";
    } else {
      classification = msg ? classifyVerifyMessage(msg) : "no-response";
    }

    return {
      ok: parsed?.status === 1 && (record !== null || (fetchedCount !== null && fetchedCount > 0)),
      httpStatus: res.status,
      payuStatus: parsed?.status ?? null,
      classification,
      environment: config.isProduction ? "production" : "test",
      message: scrub(msg || raw.slice(0, 300), secrets),
      // Ground truth for debugging: which wire format PayU used and a scrubbed
      // head of the body, so a missed field never silently disappears again.
      responseFormat: parsed && !Array.isArray(parsed) && "transaction_details" in parsed ? "json" : /status\]\s*=>/.test(raw) ? "php-array" : "unknown",
      rawExcerpt: scrub(raw.slice(0, 500), secrets),
      ...(record ? { record: JSON.parse(scrub(JSON.stringify(record), secrets)) } : {})
    };
  } catch (e) {
    return {
      ok: false,
      httpStatus: 0,
      payuStatus: null,
      classification: "request-failed",
      environment: config.isProduction ? "production" : "test",
      message: e instanceof Error ? e.message : "request failed"
    };
  }
}

async function checkCheckoutPayload(secrets: string[], origin: string): Promise<CheckSection> {
  const checkout = createPayUCheckout({
    txnid: `DIAG${Date.now().toString(36).toUpperCase()}`,
    amount: 1,
    productinfo: "Gateway self-check",
    firstname: "Diagnose",
    email: "diagnose@example.com",
    surl: `${origin}/api/payu/callback`,
    failureUrl: `${origin}/courses?payment=fail`,
    cancelUrl: `${origin}/courses?payment=cancel`
  });

  try {
    const res = await fetch(checkout.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(checkout.params).toString(),
      redirect: "manual",
      signal: AbortSignal.timeout(20000)
    });

    // A valid payload is answered with a redirect to PayU's payment page
    // (apitest.payu.in / secure.payu.in). Do not follow it — the status alone
    // proves the signature was accepted.
    const location = res.headers.get("location") ?? "";
    if (res.status >= 300 && res.status < 400 && /payu\.in/i.test(location)) {
      return {
        ok: true,
        httpStatus: res.status,
        reason: "payment-page-redirect",
        redirectedTo: scrub(new URL(location, checkout.gatewayUrl).host, secrets),
        errorDetail: null
      };
    }

    const html = (await res.text()).slice(0, 8000);
    const verdict = classifyCheckoutHtml(html);
    // PayU error pages carry the reason in a <pre> block or the page title;
    // fall back to the leading markup so nothing is silently swallowed.
    const detailMatch =
      html.match(/<pre[^>]*>([\s\S]{0,500}?)<\/pre>/i) ??
      html.match(/<title[^>]*>([\s\S]{0,200}?)<\/title>/i) ??
      html.match(/(?:error|reason)[\s\S]{0,200}/i);
    return {
      ok: verdict.ok,
      httpStatus: res.status,
      reason: verdict.reason,
      // A hash rejection page prints the exact string PayU hashed — including
      // how many pipes sit between email and salt, and PayU's copy of the
      // salt. Scrub removes our own credentials, so a redacted salt proves the
      // values match while a visible one means they differ. The posted field
      // names confirm which form shape the deployed code actually sent.
      ...(verdict.ok
        ? {}
        : {
            postedFields: Object.keys(checkout.params),
            htmlExcerpt: scrub(html.slice(0, 6000), secrets)
          }),
      errorDetail: verdict.ok
        ? null
        : scrub(
            (detailMatch ? detailMatch[1] ?? detailMatch[0] : html.slice(0, 200)).replace(
              /\s+/g,
              " "
            ),
            secrets
          )
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "request failed" };
  }
}

export async function GET(req: NextRequest) {
  const token = process.env.PAYU_DIAGNOSE_TOKEN;
  const provided = req.headers.get("x-diagnose-token") ?? "";
  if (!token || !provided || !timingSafeStringEqual(token, provided)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const report = {
    checkedAt: new Date().toISOString(),
    sections: {} as Record<string, CheckSection>
  };

  report.sections.config = checkConfig();
  if (!report.sections.config.ok) {
    return NextResponse.json(report, { status: 200 });
  }

  const config = getPayUConfig();
  const secrets = [config.key, config.salt];

  // ?txnid= mode: look up one real transaction instead of running the probe
  // suite. Used to answer "did PayU actually charge this order?" after a
  // browser-side failure.
  const txnid = req.nextUrl.searchParams.get("txnid");
  if (txnid) {
    if (!/^[A-Za-z0-9_]{1,64}$/.test(txnid)) {
      return NextResponse.json({ error: "invalid txnid format" }, { status: 400 });
    }
    report.sections.transaction = await checkTransaction(txnid, secrets);
    return NextResponse.json(report, { status: 200 });
  }

  report.sections.verifyPayment = await checkVerifyPayment(secrets);

  if (config.isProduction) {
    report.sections.checkout = { skipped: "production endpoint is never probed by this route" };
  } else {
    const origin = new URL(req.url).origin;
    report.sections.checkout = await checkCheckoutPayload(secrets, origin);
  }

  return NextResponse.json(report, { status: 200 });
}
