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

vi.mock("@/services/courseAccessService", () => ({
  assertCourseContentAccess: vi.fn(),
  canAccessCourseContent: vi.fn(),
  evaluateCourseAccess: vi.fn(),
  isCourseAccessError: vi.fn()
}));

vi.mock("@/services/certificates/certificate.service", () => ({
  issueCertificate: vi.fn(),
}));

import { submitReview, createPaymentOrder } from "@/app/(public)/courses/[courseId]/actions";
import { updateProgress } from "@/app/classroom/actions";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";

const SECRET = "test_secret_123";

describe("Student payment (Phase 4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYU_MERCHANT_SECRET = SECRET;
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "s1", role: "STUDENT" } as any);
  });

  it("createPaymentOrder rejects courses that are not found", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null as any);
    await expect(createPaymentOrder("c-none")).rejects.toThrow("Course not found");
  });
});
