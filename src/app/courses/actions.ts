"use server";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/services/payments/razorpay.service";
import { getCurrentUser } from "@/lib/auth/helpers";
import { hasCourseAccess } from "@/services/enrollmentService";
import { convertPriceToPaise } from "@/services/payments/money";
import { confirmPaidOrder } from "@/services/payments/paymentConfirmation.service";
import { Decimal } from "@prisma/client/runtime/library";

export async function createPaymentOrder(courseId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "PUBLISHED") {
    throw new Error("Course not available");
  }

  if (course.price.toNumber() === 0) {
    throw new Error("Use free enrollment service");
  }

  const alreadyEnrolled = await hasCourseAccess(user.id, courseId);
  if (alreadyEnrolled) {
    return { status: "ALREADY_ENROLLED" };
  }

  // Exact conversion using helper
  const amount = convertPriceToPaise(course.price as unknown as Decimal);

  // 1. Create Razorpay Order first
  const rzpOrder = await razorpay.orders.create({
    amount,
    currency: course.currency,
    receipt: `receipt_${user.id}_${courseId}`,
  });

  // 2. Create internal Order
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      courseId: course.id,
      amount: course.price,
      currency: course.currency,
      status: "PENDING",
      providerOrderId: rzpOrder.id
    }
  });

  return {
    key_id: process.env.RAZORPAY_KEY_ID!,
    order_id: rzpOrder.id,
    amount,
    currency: course.currency,
    internalOrderId: order.id
  };
}

export async function verifyPayment(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const paymentId = formData.get("razorpay_payment_id") as string;
  const orderId = formData.get("razorpay_order_id") as string;
  const signature = formData.get("razorpay_signature") as string;
  const internalOrderId = formData.get("internal_order_id") as string;

  if (!paymentId || !orderId || !signature || !internalOrderId) {
    throw new Error("Missing payment verification parameters");
  }

  // Retrieve internal order
  const order = await prisma.order.findUnique({
    where: { id: internalOrderId },
    include: { course: true }
  });

  if (!order || order.userId !== user.id) {
    throw new Error("Order not found or access denied");
  }

  // Verify signature
  const crypto = await import("crypto");
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
  hmac.update(order.providerOrderId + "|" + paymentId);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature !== signature) {
    throw new Error("Invalid signature");
  }

  // Use shared service for confirmation and enrollment activation setup
  await confirmPaidOrder({
      orderId: internalOrderId,
      providerPaymentId: paymentId,
      amountPaise: Math.round(Number(order.amount) * 100),
      currency: order.currency
  });

  return { success: true };
}
