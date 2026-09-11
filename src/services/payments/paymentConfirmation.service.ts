import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const confirmPaidOrder = async ({
  orderId,
  providerPaymentId,
  amountPaise,
  currency,
}: {
  orderId: string;
  providerPaymentId: string;
  amountPaise: number;
  currency: string;
}) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Load internal Order
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { course: true }
    });

    if (!order) throw new Error("Order not found");
    if (order.status === "PAID") return { success: true }; // Already processed

    // 2. Validate amount/currency
    const orderAmountPaise = Math.round(Number(order.amount) * 100);
    if (amountPaise !== orderAmountPaise || currency !== order.currency) {
      throw new Error("Payment amount/currency mismatch");
    }

    // 3. Update Order status
    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID" }
    });

    // 4. Create Payment record (will throw if providerPaymentId not unique)
    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: "RAZORPAY",
        providerPaymentId,
        amount: order.amount,
        status: "PAID",
        paidAt: new Date()
      }
    });

    // 5. Create Enrollment (will throw if already enrolled (P2002))
    try {
        await tx.enrollment.create({
            data: {
                userId: order.userId,
                courseId: order.courseId,
                status: "ACTIVE"
            }
        });
    } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) {
            throw e; // Rethrow if not a duplicate enrollment error
        }
    }

    return { success: true };
  });
};
