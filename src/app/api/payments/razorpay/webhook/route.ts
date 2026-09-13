import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) return new NextResponse("Missing signature", { status: 400 });

  const rawBody = await req.text();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return new NextResponse("Webhook configuration missing", { status: 500 });
  
  // Manual signature verification (avoids Razorpay SDK type error)
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) return new NextResponse("Invalid signature", { status: 400 });

  const event = JSON.parse(rawBody);
  const eventId = req.headers.get("x-razorpay-event-id") || event.id;
  if (!eventId) return new NextResponse("Missing event ID", { status: 400 });

  // WebhookEvent logging removed to align with current schema.

  try {
    if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const providerOrderId = payment.order_id;
        
        const internalOrder = await prisma.order.findUnique({
            where: { providerOrderId },
            include: { course: true }
        });

        if (internalOrder && internalOrder.status !== "PAID") {
             const orderAmountPaise = Math.round(Number(internalOrder.amount) * 100);
             if (payment.amount === orderAmountPaise && payment.currency === internalOrder.currency) {
                 await prisma.$transaction([
                     prisma.order.update({
                         where: { id: internalOrder.id },
                         data: { status: "PAID" }
                     }),
                     prisma.payment.create({
                         data: {
                             orderId: internalOrder.id,
                             provider: "RAZORPAY",
                             providerPaymentId: payment.id,
                             amount: internalOrder.amount,
                             status: "PAID",
                             paidAt: new Date(payment.captured_at * 1000)
                         }
                     })
                 ]);
             }
        }
    }
  } catch (err) {
      console.error("Webhook processing error:", err);
      return new NextResponse("Webhook processing failed", { status: 500 });
  }

  return new NextResponse("Webhook processed", { status: 200 });
}
