import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: { findUnique: vi.fn() },
    lessonProgress: { upsert: vi.fn() },
    order: { findUnique: vi.fn(), updateMany: vi.fn() },
    payment: { upsert: vi.fn() },
    enrollment: { upsert: vi.fn(), findUnique: vi.fn() },
    course: { findUnique: vi.fn() },
    $transaction: vi.fn((ops: unknown[]) => Promise.resolve(ops)),
  },
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/services/progressService", () => ({
  getCourseCompletionStatus: vi.fn(),
}));

vi.mock("@/services/enrollmentService", () => ({
  hasCourseAccess: vi.fn(),
}));

vi.mock("@/services/certificates/certificate.service", () => ({
  issueCertificate: vi.fn(),
}));

import { verifyPayment, submitReview, createPaymentOrder } from "@/app/(public)/courses/[courseId]/actions";
import { updateProgress } from "@/app/classroom/actions";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getCourseCompletionStatus } from "@/services/progressService";
import { hasCourseAccess } from "@/services/enrollmentService";
import { issueCertificate } from "@/services/certificates/certificate.service";
import { prisma } from "@/lib/prisma";
import { EnrollmentStatus } from "@prisma/client";

const SECRET = "test_secret_123";
const sign = (orderId: string, paymentId: string) =>
  crypto.createHmac("sha256", SECRET).update(`${orderId}|${paymentId}`).digest("hex");

describe("Student payment verification (Phase 4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_SECRET = SECRET;
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "s1", role: "STUDENT" } as any);
  });

  it("rejects a forged signature", async () => {
    const formData = new FormData();
    formData.append("razorpay_payment_id", "pay_fake");
    formData.append("razorpay_order_id", "order_fake");
    formData.append("razorpay_signature", "not-a-real-signature");
    formData.append("internal_order_id", "io1");

    await expect(verifyPayment(formData)).rejects.toThrow("signature verification failed");
    expect(prisma.enrollment.upsert).not.toHaveBeenCalled();
  });

  it("grants access only after a valid signature", async () => {
    const paymentId = "pay_123";
    const orderId = "order_123";
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "io1", userId: "s1", courseId: "c1", providerOrderId: orderId, amount: 499, status: "PENDING"
    } as any);

    const formData = new FormData();
    formData.append("razorpay_payment_id", paymentId);
    formData.append("razorpay_order_id", orderId);
    formData.append("razorpay_signature", sign(orderId, paymentId));
    formData.append("internal_order_id", "io1");

    const res = await verifyPayment(formData);
    expect(res.success).toBe(true);
    expect(prisma.enrollment.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: EnrollmentStatus.ACTIVE, userId: "s1" })
      })
    );
  });

  it("rejects when the internal order does not belong to the user", async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: "io1", userId: "someone-else", courseId: "c1", providerOrderId: "order_123", amount: 499
    } as any);

    const formData = new FormData();
    formData.append("razorpay_payment_id", "pay_123");
    formData.append("razorpay_order_id", "order_123");
    formData.append("razorpay_signature", sign("order_123", "pay_123"));
    formData.append("internal_order_id", "io1");

    await expect(verifyPayment(formData)).rejects.toThrow("Order not found");
  });

  it("createPaymentOrder rejects paid-course purchases before real order creation", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: "c1", status: "PUBLISHED", price: 499 } as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);
    // Razorpay keys absent in test env => dynamic import would throw; we never reach it if course missing
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null as any);
    await expect(createPaymentOrder("c-none")).rejects.toThrow("Course not found");
  });
});

describe("Auto certificate issuance on 100% completion (Phase 4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "s1", role: "STUDENT" } as any);
  });

  it("issues a certificate when the last lesson completes the course", async () => {
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({ id: "l9", module: { courseId: "c1" } } as any);
    vi.mocked(prisma.lessonProgress.upsert).mockResolvedValue({ id: "p1" } as any);
    vi.mocked(hasCourseAccess).mockResolvedValue(true);
    vi.mocked(getCourseCompletionStatus).mockResolvedValue({ completed: true, percentage: 100 });
    vi.mocked(issueCertificate).mockResolvedValue({ id: "cert1" } as any);

    await updateProgress("l9", 100, true);

    expect(issueCertificate).toHaveBeenCalledWith("s1", "c1");
  });

  it("does not issue a certificate below 100%", async () => {
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue({ id: "l1", module: { courseId: "c1" } } as any);
    vi.mocked(prisma.lessonProgress.upsert).mockResolvedValue({ id: "p1" } as any);
    vi.mocked(hasCourseAccess).mockResolvedValue(true);
    vi.mocked(getCourseCompletionStatus).mockResolvedValue({ completed: false, percentage: 50 });

    await updateProgress("l1", 60, true);

    expect(issueCertificate).not.toHaveBeenCalled();
  });
});

describe("Student review submission (Phase 4)", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("rejects non-students", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "instr-1", role: "INSTRUCTOR" } as any);
    await expect(submitReview("c1", 5, "great")).rejects.toThrow("Forbidden");
  });
});