"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import crypto from "crypto";
import type { Order } from "@prisma/client";

interface CheckoutOrder {
  id: string;
  amount: number;
  currency: string;
}

interface CheckoutClient {
  convertPriceToPaise: (price: Order["amount"]) => number;
  createOrder: (params: { amount: number; currency: string; receipt: string }) => Promise<CheckoutOrder>;
}

async function getCheckoutClient(): Promise<CheckoutClient> {
  const mod = await import("@/services/payments/razorpay.service");
  return {
    convertPriceToPaise: mod.convertPriceToPaise,
    createOrder: (params) =>
      (mod.razorpay.orders.create as unknown as (p: unknown) => Promise<CheckoutOrder>)(params)
  };
}

export async function createPaymentOrder(courseId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "STUDENT") throw new Error("Forbidden: student enrollment only");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");
  if (course.status !== "PUBLISHED") throw new Error("Course not published");
  if (Number(course.price) <= 0) throw new Error("Course is not paid");

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } }
  });
  if (existing && existing.status === "ACTIVE") {
    return { status: "ALREADY_ENROLLED" };
  }

  const checkout = await getCheckoutClient();
  const amount = checkout.convertPriceToPaise(course.price);

  const order = await checkout.createOrder({
    amount,
    currency: course.currency || "INR",
    receipt: `course_${courseId}_${user.id}`
  });

  const internalOrder = await prisma.order.create({
    data: {
      userId: user.id,
      courseId,
      amount: course.price,
      currency: course.currency || "INR",
      status: "PENDING",
      providerOrderId: order.id
    }
  });

  return {
    key_id: process.env.RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency,
    order_id: order.id,
    internalOrderId: internalOrder.id
  };
}

export async function verifyPayment(data: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const paymentId = String(data.get("razorpay_payment_id") || "");
  const orderId = String(data.get("razorpay_order_id") || "");
  const signature = String(data.get("razorpay_signature") || "");
  const internalOrderId = String(data.get("internal_order_id") || "");

  if (!paymentId || !orderId || !signature || !internalOrderId) {
    throw new Error("Invalid payment payload");
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("Payment gateway not configured");

  // Server-authoritative signature check (order_id | payment_id, HMAC-SHA256)
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  if (expected !== signature) {
    throw new Error("Payment signature verification failed");
  }

  const internalOrder = await prisma.order.findUnique({
    where: { id: internalOrderId },
    include: { course: true }
  });
  if (!internalOrder || internalOrder.userId !== user.id) {
    throw new Error("Order not found");
  }
  if (internalOrder.providerOrderId !== orderId) {
    throw new Error("Order mismatch");
  }

  // Idempotent grant of access: mark paid exactly once, ensure active enrollment
  await prisma.$transaction([
    prisma.order.updateMany({
      where: { id: internalOrder.id, status: { not: "PAID" } },
      data: { status: "PAID" }
    }),
    prisma.payment.upsert({
      where: { providerPaymentId: paymentId },
      update: {},
      create: {
        orderId: internalOrder.id,
        provider: "RAZORPAY",
        providerPaymentId: paymentId,
        amount: internalOrder.amount,
        status: "PAID",
        paidAt: new Date()
      }
    }),
    prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: internalOrder.courseId } },
      update: { status: "ACTIVE" },
      create: { userId: user.id, courseId: internalOrder.courseId, status: "ACTIVE" }
    })
  ]);

  return { success: true };
}

export async function submitReview(courseId: string, rating: number, comment: string | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "STUDENT") throw new Error("Forbidden: students only");

  const { createReview } = await import("@/services/reviews/review.service");
  await createReview(user.id, courseId, rating, comment);
  return { success: true };
}