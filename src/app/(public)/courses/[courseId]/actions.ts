"use server";
export async function createPaymentOrder(courseId: string) {
  // Stub: returns shape expected by EnrollButton
  return {
    id: courseId,
    key_id: process.env.RAZORPAY_KEY_ID || "test_key",
    amount: 0,
    currency: "INR",
    order_id: "test_order_" + courseId,
    internalOrderId: "test_internal_" + courseId
  };
}
export async function verifyPayment(data: FormData) {
  return { success: true };
}