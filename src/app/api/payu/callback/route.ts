import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const { mihpayid, txnid, status, amount, currency, hash } = data;

    const salt = process.env.PAYU_MERCHANT_SECRET;
    const key = process.env.PAYU_MERCHANT_KEY;

    if (!salt || !key) {
      return NextResponse.redirect(new URL("/courses?payment=error", req.url));
    }

    // Verify hash
    // Standard PayU reverse hash formula: sha512(salt|status|...|key)
    const hashString = `${salt}|${status}||||||||||${data.udf5 || ""}|${data.udf4 || ""}|${data.udf3 || ""}|${data.udf2 || ""}|${data.udf1 || ""}|${data.email || ""}|${data.firstname || ""}|${data.productinfo || ""}|${amount || ""}|${txnid || ""}|${key}`;
    const expectedHash = crypto.createHash("sha512").update(hashString).digest("hex");

    if (expectedHash !== hash || status !== "success") {
      return NextResponse.redirect(new URL("/courses?payment=failed", req.url));
    }

    const internalOrder = await prisma.order.findUnique({
      where: { providerOrderId: txnid },
      include: { course: true }
    });

    if (!internalOrder) {
      return NextResponse.redirect(new URL("/courses?payment=not_found", req.url));
    }

    if (internalOrder.status !== "PAID") {
      await confirmPaidOrder({
        orderId: internalOrder.id,
        providerPaymentId: mihpayid || txnid,
        amountPaise: Math.round(Number(amount) * 100),
        currency: currency || "INR",
        provider: "PAYU"
      });
    }

    return NextResponse.redirect(new URL("/my-learning?payment=success", req.url));
  } catch (err) {
    console.error("PayU Callback Error:", err);
    return NextResponse.redirect(new URL("/courses?payment=error", req.url));
  }
}

// PayU can also send GET callbacks depending on merchant configuration
export async function GET(req: NextRequest) {
  return POST(req);
}
