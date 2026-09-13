import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) return new NextResponse("Missing signature", { status: 400 });

  const rawBody = await req.text();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return new NextResponse("Webhook configuration missing", { status: 500 });
  
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) return new NextResponse("Invalid signature", { status: 400 });

  const event = JSON.parse(rawBody);
  const eventId = req.headers.get("x-razorpay-event-id") || event.id;
  if (!eventId) return new NextResponse("Missing event ID", { status: 400 });

  try {
    // Atomically claim processing rights or detect existing state
    let webhookEvent = await prisma.webhookEvent.findUnique({
      where: { providerEventId: eventId }
    });

    if (webhookEvent) {
      if (webhookEvent.status === "PROCESSED") {
        return new NextResponse("Event already processed", { status: 200 });
      }
      
      if (webhookEvent.status === "PROCESSING") {
        // Check if the processing worker has stalled (e.g., > 5 minutes ago)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (webhookEvent.updatedAt < fiveMinutesAgo) {
          // Recover stale lock and claim processing rights
          webhookEvent = await prisma.webhookEvent.update({
            where: { providerEventId: eventId },
            data: { status: "PROCESSING", updatedAt: new Date() }
          });
        } else {
          // Another worker is actively processing; return 409 or safe response
          return new NextResponse("Processing in progress", { status: 409 });
        }
      }

      if (webhookEvent.status === "FAILED") {
        // Allow retry: transition back to PROCESSING
        webhookEvent = await prisma.webhookEvent.update({
          where: { providerEventId: eventId },
          data: { status: "PROCESSING", updatedAt: new Date() }
        });
      }
    } else {
      // New event: create record in RECEIVED state immediately, then transition
      webhookEvent = await prisma.webhookEvent.create({
        data: { providerEventId: eventId, eventType: event.event, status: "RECEIVED" }
      });
      
      // Immediately mark as PROCESSING to claim rights
      await prisma.webhookEvent.update({
        where: { providerEventId: eventId },
        data: { status: "PROCESSING", updatedAt: new Date() }
      });
    }

    // Business Processing
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
          try {
            await prisma.$transaction([
              prisma.order.update({ where: { id: internalOrder.id }, data: { status: "PAID" } }),
              prisma.payment.create({
                data: {
                  orderId: internalOrder.id,
                  provider: "RAZORPAY",
                  providerPaymentId: payment.id,
                  amount: internalOrder.amount,
                  status: "PAID",
                  paidAt: new Date(payment.captured_at * 1000)
                }
              }),
              prisma.enrollment.create({
                data: { userId: internalOrder.userId, courseId: internalOrder.courseId, status: "ACTIVE" }
              })
            ]);
            
            // Mark PROCESSED
            await prisma.webhookEvent.update({
              where: { providerEventId: eventId },
              data: { status: "PROCESSED", processedAt: new Date(), updatedAt: new Date() }
            });
          } catch (err) {
            // Mark FAILED to allow retry
            await prisma.webhookEvent.update({
              where: { providerEventId: eventId },
              data: { status: "FAILED", updatedAt: new Date() }
            });
            console.error("Webhook processing error:", err);
            return new NextResponse("Webhook processing failed", { status: 500 });
          }
        }
      } else if (internalOrder && internalOrder.status === "PAID") {
        // Order already paid; mark as PROCESSED safely without creating duplicates
        await prisma.webhookEvent.update({
          where: { providerEventId: eventId },
          data: { status: "PROCESSED", processedAt: new Date(), updatedAt: new Date() }
        });
      }
    }

    return new NextResponse("Webhook processed", { status: 200 });
  } catch (err) {
    console.error("Webhook general error:", err);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}
