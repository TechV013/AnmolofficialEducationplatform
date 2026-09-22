import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // PayU webhooks are application/x-www-form-urlencoded
  const formData = await req.formData();
  const data = Object.fromEntries(formData.entries());
  
  const { mihpayid, txnid, status, amount, currency, hash } = data as any;

  // 1. Verify Hash
  const salt = process.env.PAYU_MERCHANT_SECRET;
  if (!salt) return new NextResponse("Webhook configuration missing", { status: 500 });
  
  // PayU hash verification formula (simplified, adjust based on official PayU v2 docs)
  // Standard PayU reverse hash formula: sha512(salt|status|...|key)
  const hashString = `${salt}|${status}||||||||||${data.udf5}|${data.udf4}|${data.udf3}|${data.udf2}|${data.udf1}|${data.email}|${data.firstname}|${data.productinfo}|${amount}|${txnid}|${data.key}`;
  const expectedHash = crypto.createHash("sha512").update(hashString).digest("hex");

  if (expectedHash !== hash) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (status !== "success") {
    return new NextResponse("Payment not successful", { status: 200 });
  }

  try {
    // 2. Identify and confirm order
    // txnid is our providerOrderId
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
      providerPaymentId: mihpayid,
      amountPaise: Math.round(Number(amount) * 100),
      currency: currency || "INR",
      provider: "PAYU"
    });

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (err) {
    console.error("PayU Webhook error:", err);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}
