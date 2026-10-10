import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import { generatePayUResponseHash, parseAmountToPaise } from "@/services/payments/payu.service";
import { getPayUConfig } from "@/services/payments/payuConfig";
import crypto from "crypto";

// The webhook is PayU's server-to-server retry path; it must outlast a cold
// start plus the confirmation transaction rather than dying at the default
// 10s gateway limit and losing the only delivery that still reaches us.
export const maxDuration = 30;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  // PayU webhooks are application/x-www-form-urlencoded
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return new NextResponse("Invalid payload", { status: 400 });
  }
  const data = Object.fromEntries(formData.entries()) as Record<string, string>;

  const { mihpayid, txnid, status, amount, currency, hash } = data;

  let config;
  try {
    config = getPayUConfig();
  } catch {
    return new NextResponse("Webhook configuration missing", { status: 500 });
  }

  // The reverse hash must be recomputed with our own merchant key. Trusting the
  // key supplied in the payload would let a caller pick the key their hash was
  // built from.
  if (!safeEqual(data.key || "", config.key)) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const expectedHash = generatePayUResponseHash(data, config.salt, config.key);
  if (!safeEqual(expectedHash, hash || "")) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (status !== "success") {
    return new NextResponse("Payment not successful", { status: 200 });
  }

  try {
    const amountPaise = parseAmountToPaise(amount);
    if (amountPaise === null) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    // 2. Identify and confirm order
    const internalOrder = await prisma.order.findUnique({
      where: { providerOrderId: txnid },
      include: { course: true }
    });

    if (!internalOrder) {
      return new NextResponse("Order not found", { status: 404 });
    }

    if (internalOrder.status === "PAID") {
      return new NextResponse("Order already processed", { status: 200 });
    }

    // 3. Confirm Order (Generic provider-agnostic confirmation)
    await confirmPaidOrder({
      orderId: internalOrder.id,
      providerPaymentId: mihpayid || txnid,
      amountPaise,
      currency: currency || internalOrder.currency,
      provider: "PAYU"
    });

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (err) {
    console.error("PayU Webhook error:", err);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}