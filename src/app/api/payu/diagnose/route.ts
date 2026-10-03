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

async function checkVerifyPayment(secrets: string[]): Promise<CheckSection> {
  const config = getPayUConfig();
  const base = getPayUCheckoutUrl().replace(/\/_payment$/, "");
  const var1 = `DIAG${Date.now().toString(36).toUpperCase()}`;
  const hash = sha512([config.key, "verify_payment", var1, config.salt].join("|"));

  try {
    const res = await fetch(`${base}/merchant/postservice?form=1`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key: config.key,
        command: "verify_payment",
        var1,
        hash
      }).toString(),
      signal: AbortSignal.timeout(20000)
    });
    const raw = (await res.text()).slice(0, 2000);
    let parsed: { status?: number; msg?: string } | null = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Non-JSON body: fall through and report the scrubbed raw text below.
    }
    const msg = parsed?.msg ?? "";
    return {
      // status 1 = API healthy. status 0 with an unknown txnid still proves the
      // key and hash were accepted — only a key/hash complaint is a failure.
      ok: parsed?.status === 1 || (parsed?.status === 0 && classifyVerifyMessage(msg) === "unknown-transaction"),
      httpStatus: res.status,
      payuStatus: parsed?.status ?? null,
      classification: parsed && !msg ? null : classifyVerifyMessage(msg),
      message: scrub(msg || raw.slice(0, 300), secrets)
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "request failed" };
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
      signal: AbortSignal.timeout(20000)
    });
    const html = (await res.text()).slice(0, 5000);
    const verdict = classifyCheckoutHtml(html);
    return {
      ok: verdict.ok,
      httpStatus: res.status,
      reason: verdict.reason,
      errorDetail: verdict.ok
        ? null
        : scrub(
            (() => {
              const match = html.match(/error\s*reason[\s\S]{0,200}/i);
              return (match ? match[0] : html.slice(0, 200)).replace(/\s+/g, " ");
            })(),
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

  report.sections.verifyPayment = await checkVerifyPayment(secrets);

  if (config.isProduction) {
    report.sections.checkout = { skipped: "production endpoint is never probed by this route" };
  } else {
    const origin = new URL(req.url).origin;
    report.sections.checkout = await checkCheckoutPayload(secrets, origin);
  }

  return NextResponse.json(report, { status: 200 });
}
