import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import { generatePayUResponseHash, parseAmountToPaise } from "@/services/payments/payu.service";
import { getPayUConfig } from "@/services/payments/payuConfig";
import crypto from "crypto";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    const { mihpayid, txnid, status, amount, currency, hash } = data;

    const config = getPayUConfig();
    const salt = config.salt;
    const key = config.key;

    const expectedHash = generatePayUResponseHash(data, salt, key);
    // A matching hash proves the postback came from PayU and was not tampered
    // with in transit, which is the only basis for granting an enrolment.
    if (!safeEqual(expectedHash, hash || "") || status !== "success") {
      return NextResponse.redirect(new URL("/courses?payment=failed", req.url));
    }

    const amountPaise = parseAmountToPaise(amount);
    if (amountPaise === null) {
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
        amountPaise,
        currency: currency || internalOrder.currency,
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