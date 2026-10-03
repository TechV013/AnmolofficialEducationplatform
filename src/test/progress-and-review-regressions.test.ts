import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { hasCourseAccess } from "@/services/enrollmentService";
import { createReview } from "@/services/reviews/review.service";
import { updateProgress } from "@/app/classroom/actions";
import { EnrollmentStatus } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: { findUnique: vi.fn() },
    enrollment: { findUnique: vi.fn() },
    lessonProgress: { upsert: vi.fn() },
    review: { upsert: vi.fn() }
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
  requireRole: vi.fn()
}));

vi.mock("@/services/courseAccessService", () => ({
  assertCourseContentAccess: vi.fn(),
  canAccessCourseContent: vi.fn()
}));

vi.mock("@/services/certificate.service", () => ({
  issueCertificate: vi.fn()
}));

// The completion/certificate branch is covered elsewhere; stub it so these tests
// assert only the completedAt semantics.
vi.mock("@/services/progressService", () => ({
  getCourseCompletionStatus: vi.fn().mockResolvedValue({ completed: false, percent: 100 })
}));

const student = { id: "user-1", role: "STUDENT", email: "s@a.com", name: "S" };

describe("course access includes completed enrollments", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("ACTIVE enrollment grants access", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ status: EnrollmentStatus.ACTIVE } as any);
    await expect(hasCourseAccess("user-1", "course-1")).resolves.toBe(true);
  });

  // A student who finished the course keeps classroom access via
  // courseAccessService, so the review form must not disappear for them.
  it("COMPLETED enrollment still grants access", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ status: EnrollmentStatus.COMPLETED } as any);
    await expect(hasCourseAccess("user-1", "course-1")).resolves.toBe(true);
  });

  it("cancelled enrollment does not grant access", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ status: "CANCELLED" } as any);
    await expect(hasCourseAccess("user-1", "course-1")).resolves.toBe(false);
  });

  it("no enrollment row does not grant access", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);
    await expect(hasCourseAccess("user-1", "course-1")).resolves.toBe(false);
  });
});

describe("createReview enrollment gate", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("completed student may review", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ status: EnrollmentStatus.COMPLETED } as any);
    vi.mocked(prisma.review.upsert).mockResolvedValue({ id: "r1" } as any);

    await expect(createReview("user-1", "course-1", 5, "great")).resolves.toEqual({ id: "r1" });
    expect(prisma.review.upsert).toHaveBeenCalledOnce();
  });

  it("cancelled enrollment is rejected", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ status: "CANCELLED" } as any);

    await expect(createReview("user-1", "course-1", 5, null)).rejects.toThrow(/Enroll in this course/);
    expect(prisma.review.upsert).not.toHaveBeenCalled();
  });

  it("rejects out-of-range and non-integer ratings", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ status: EnrollmentStatus.ACTIVE } as any);

    await expect(createReview("user-1", "course-1", 0, null)).rejects.toThrow("Invalid rating");
    await expect(createReview("user-1", "course-1", 6, null)).rejects.toThrow("Invalid rating");
    await expect(createReview("user-1", "course-1", 4.5, null)).rejects.toThrow("Invalid rating");
    expect(prisma.review.upsert).not.toHaveBeenCalled();
  });
});

describe("updateProgress must not erase completion", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const lesson = {
    id: "lesson-1",
    module: { courseId: "course-1", course: { id: "course-1" } }
  };

  async function run(completed: boolean) {
    vi.mocked(getCurrentUser).mockResolvedValue(student as any);
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue(lesson as any);
    vi.mocked(prisma.lessonProgress.upsert).mockResolvedValue({ id: "p1" } as any);
    await updateProgress("lesson-1", 120, completed);
    return vi.mocked(prisma.lessonProgress.upsert).mock.calls[0][0];
  }

  // The regression: an ordinary playback tick used to write completedAt: null,
  // silently un-completing a lesson the student had already finished.
  it("incomplete tick omits completed/completedAt entirely", async () => {
    const arg = await run(false);
    expect(arg.update).toEqual({
      watchedSeconds: 120,
      lastWatchedAt: expect.any(Date)
    });
    expect(arg.update).not.toHaveProperty("completed");
    expect(arg.update).not.toHaveProperty("completedAt");
  });

  it("completed tick sets completed and completedAt", async () => {
    const arg = await run(true);
    expect(arg.update.completed).toBe(true);
    expect(arg.update.completedAt).toEqual(expect.any(Date));
  });

  it("unauthenticated update is rejected", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    await expect(updateProgress("lesson-1", 10, false)).rejects.toThrow("Unauthorized");
    expect(prisma.lessonProgress.upsert).not.toHaveBeenCalled();
  });

  it("unknown lesson is rejected", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(student as any);
    vi.mocked(prisma.lesson.findUnique).mockResolvedValue(null);
    await expect(updateProgress("nope", 10, false)).rejects.toThrow("Lesson not found");
  });
});
