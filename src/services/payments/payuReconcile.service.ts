import crypto from "crypto";
import { getPayUConfig } from "./payuConfig";
import { parseAmountToPaise } from "./payu.service";
import { confirmPaidOrder } from "./paymentConfirmation.service";
import { prisma } from "@/lib/prisma";

function sha512(value: string): string {
  return crypto.createHash("sha512").update(value, "utf8").digest("hex");
}

/** Statuses PayU reports that mean the money moved and the order is final. */
const SUCCESS_STATUSES = new Set(["success", "captured"]);
const FAILURE_STATUSES = new Set(["failure", "failed", "cancelled", "expired"]);

interface PayUVerifyResponse {
  status?: number;
  msg?: string;
  transaction_details?: Record<string, Record<string, unknown>>;
}

/**
 * Query PayU's verify_payment API for a single transaction. Returns null when
 * the request fails, the response is unparseable, or the transaction is not
 * found — callers should leave any pending order untouched in those cases.
 */
async function fetchTransaction(txnid: string) {
  const { key, salt, isProduction } = getPayUConfig();
  const base = isProduction ? "https://secure.payu.in" : "https://test.payu.in";
  const hash = sha512([key, "verify_payment", txnid, salt].join("|"));

  const res = await fetch(`${base}/merchant/postservice?form=2`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ key, command: "verify_payment", var1: txnid, hash }).toString(),
    signal: AbortSignal.timeout(15000)
  });
  if (!res.ok) return null;

  let body: PayUVerifyResponse;
  try {
    body = (await res.json()) as PayUVerifyResponse;
  } catch {
    return null;
  }
  if (body.status !== 1 || !body.transaction_details) return null;

  const record = body.transaction_details[txnid];
  if (!record || typeof record !== "object") return null;
  return record as Record<string, string>;
}

/**
 * Fallback when verify_payment cannot be reached or the response is
 * unrecognised: leave the pending order alone rather than guessing.
 */
function classify(record: Record<string, string>): "success" | "failure" | "unknown" {
  const status = String(record.status ?? record.unmappedstatus ?? "").toLowerCase();
  if (SUCCESS_STATUSES.has(status)) return "success";
  if (FAILURE_STATUSES.has(status)) return "failure";
  return "unknown";
}

/**
 * Reconcile a single pending order against PayU's authoritative transaction
 * state. Used as a safety net when the browser callback times out and the
 * webhook has not (yet) delivered.
 *
 * Idempotent: an already-PAID order is a no-op; a duplicate enrollment is
 * swallowed. Never throws — a reconcile failure must not break the page load
 * that triggered it.
 */
export async function reconcilePendingOrder(orderId: string): Promise<void> {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "PENDING") return;

    const record = await fetchTransaction(order.providerOrderId);
    if (!record) return;

    const verdict = classify(record);
    if (verdict === "success") {
      const amountPaise = parseAmountToPaise(record.amt ?? record.amount);
      if (amountPaise === null) return;
      await confirmPaidOrder({
        orderId: order.id,
        providerPaymentId: record.mihpayid || `verify:${order.providerOrderId}`,
        amountPaise,
        currency: record.currency || order.currency
      });
      console.log(`[reconcile] order ${order.providerOrderId} confirmed PAID via verify_payment`);
    } else if (verdict === "failure") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" }
      });
      console.log(`[reconcile] order ${order.providerOrderId} marked FAILED via verify_payment`);
    }
  } catch (e) {
    console.error("[reconcile] failed:", e);
  }
}

/**
 * Find the most recent pending order for a user+course and reconcile it.
 * Called from the course page after a payment attempt so a timed-out callback
 * or undelivered webhook still results in access being granted.
 */
export async function reconcileLatestPendingOrder(userId: string, courseId: string): Promise<void> {
  const pending = await prisma.order.findFirst({
    where: { userId, courseId, status: "PENDING" },
    orderBy: { createdAt: "desc" }
  });
  if (!pending) return;
  await reconcilePendingOrder(pending.id);
}
