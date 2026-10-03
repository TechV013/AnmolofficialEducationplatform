"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createPayUCheckout } from "@/services/payments/payu.service";
import { getPublicOrigin, PaymentConfigError, isPayUConfigured } from "@/services/payments/payuConfig";

export async function createPaymentOrder(courseId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  if (user.role !== "STUDENT") throw new Error("Forbidden: student enrollment only");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");
  if (course.status !== "PUBLISHED") throw new Error("Course not published");
  const amountRupees = Number(course.price);
  if (!(amountRupees > 0)) throw new Error("Course is not paid");

  // Checked after the course is known to be payable so a bad course id is not
  // reported to the student as a payments outage.
  if (!isPayUConfigured()) {
    throw new Error("Payments are not available right now. Please contact support.");
  }

  // The session does not carry a phone number, and PayU uses it for fraud
  // checks, so it is read from the stored profile.
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { phone: true }
  });

  const origin = getPublicOrigin();
  if (!origin) throw new PaymentConfigError("NEXTAUTH_URL must be set to build PayU return URLs.");

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

  if ("alreadyEnrolled" in result) return { status: "ALREADY_ENROLLED" as const };

  // PayU rejects a txnid that has already completed, and the stored forward hash
  // was only ever valid for the attempt it was generated for. An abandoned
  // pending order is therefore cancelled and a fresh transaction started.
  if ("existingOrder" in result && result.existingOrder) {
    await prisma.order.update({
      where: { id: result.existingOrder.id },
      data: { status: "CANCELLED" }
    });
  }

  const txnid = `PAYU_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const currency = course.currency || "INR";

  const checkout = createPayUCheckout({
    txnid,
    // PayU expects major units. Sending paise would charge 100x the listed price.
    amount: amountRupees,
    productinfo: course.title,
    firstname: user.name?.trim() || "Student",
    email: user.email || "",
    phone: profile?.phone ?? null,
    surl: `${origin}/api/payu/callback`,
    failureUrl: `${origin}/courses/${courseId}?payment=fail`,
    cancelUrl: `${origin}/courses/${courseId}?payment=cancel`
  });

  const internalOrder = await prisma.order.create({
    data: {
      userId: user.id,
      courseId,
amount: amountRupees,
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