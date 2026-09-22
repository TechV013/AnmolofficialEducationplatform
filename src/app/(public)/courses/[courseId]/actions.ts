"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import crypto from "crypto";
import { createPayUCheckout } from "@/services/payments/payu.service";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import type { Order } from "@prisma/client";

export async function createPaymentOrder(courseId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "STUDENT") throw new Error("Forbidden: student enrollment only");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");
  if (course.status !== "PUBLISHED") throw new Error("Course not published");
  if (Number(course.price) <= 0) throw new Error("Course is not paid");

  // Atomic check-and-create to prevent duplicate PENDING orders from concurrent clicks
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } }
    });
    if (existing && (existing.status === "ACTIVE" || existing.status === "COMPLETED")) {
      return { alreadyEnrolled: true as const };
    }

    const pendingOrder = await tx.order.findFirst({
      where: { userId: user.id, courseId, status: "PENDING" },
      orderBy: { createdAt: "desc" }
    });
    if (pendingOrder) {
      return { existingOrder: pendingOrder };
    }

    return { createNew: true as const };
  });

  if ("alreadyEnrolled" in result) return { status: "ALREADY_ENROLLED" };

  if ("existingOrder" in result && result.existingOrder) {
    const o = result.existingOrder;
    return {
      checkoutUrl: o.providerOrderId,
      internalOrderId: o.id
    };
  }

  const amountPaise = Math.round(Number(course.price) * 100);
  const txnid = `PAYU_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const currency = course.currency || "INR";

  const checkout = await createPayUCheckout({
    txnid,
    amount: amountPaise,
    productinfo: course.title,
    firstname: user.name || "Student",
    email: user.email || "",
    phone: "9999999999",
    surl: `${process.env.NEXTAUTH_URL}/api/payu/callback`,
    failureUrl: `${process.env.NEXTAUTH_URL}/courses/${courseId}?payment=fail`,
    cancelUrl: `${process.env.NEXTAUTH_URL}/courses/${courseId}?payment=cancel`
  });

  const internalOrder = await prisma.order.create({
    data: {
      userId: user.id,
      courseId,
      amount: course.price,
      currency,
      status: "PENDING",
      providerOrderId: txnid
    }
  });

  return {
    checkoutUrl: checkout.gatewayUrl,
    params: checkout.params,
    internalOrderId: internalOrder.id
  };
}

export async function submitReview(courseId: string, rating: number, comment: string | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "STUDENT") throw new Error("Forbidden: students only");

  const { createReview } = await import("@/services/reviews/review.service");
  await createReview(user.id, courseId, rating, comment);
  return { success: true };
}