/**
 * Comprehensive authorization matrix for course content access.
 *
 * Covers every dimension of the policy in courseAccessService.ts:
 *   - Authentication / account status
 *   - ADMIN bypass (draft, paid, not enrolled)
 *   - INSTRUCTOR bypass (own course, any status)
 *   - INSTRUCTOR non-owner (published paid, no enrollment → PURCHASE_REQUIRED)
 *   - Free published courses  → any signed-in user
 *   - Free non-published      → denied (NOT_PUBLISHED)
 *   - Paid published + ACTIVE enrollment  → allowed
 *   - Paid published + COMPLETED enrollment → allowed (lifetime access)
 *   - Paid published + CANCELLED enrollment → denied
 *   - Paid published + no enrollment       → denied (PURCHASE_REQUIRED)
 *   - Course not found
 *   - CourseAccessError thrown by assertCourseContentAccess
 *   - canAccessCourseContent boolean wrapper
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    course: { findUnique: vi.fn() },
    enrollment: { findUnique: vi.fn() }
  }
}));

import {
  evaluateCourseAccess,
  canAccessCourseContent,
  assertCourseContentAccess,
  CourseAccessError,
  isCourseAccessError
} from "@/services/courseAccessService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mkUser = (role: "STUDENT" | "INSTRUCTOR" | "ADMIN", isActive = true) => ({
  role,
  isActive
});

const mkCourse = (
  price: number,
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED",
  instructorIds: string[] = []
) => ({
  id: "course-1",
  price,
  status,
  instructors: instructorIds.map((userId) => ({ userId }))
});

const mkEnrollment = (status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED") => ({
  status
});

const USER_ID = "user-1";
const COURSE_ID = "course-1";

// ---------------------------------------------------------------------------

describe("evaluateCourseAccess – authentication guard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns UNAUTHENTICATED when userId is null", async () => {
    const d = await evaluateCourseAccess({ userId: null, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("UNAUTHENTICATED");
  });

  it("returns UNAUTHENTICATED when userId is undefined", async () => {
    const d = await evaluateCourseAccess({ userId: undefined, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("UNAUTHENTICATED");
  });

  it("returns UNAUTHENTICATED when userId is empty string", async () => {
    const d = await evaluateCourseAccess({ userId: "", courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("UNAUTHENTICATED");
  });
});

describe("evaluateCourseAccess – inactive / missing user", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns USER_INACTIVE when user is not found in DB", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "PUBLISHED") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("USER_INACTIVE");
  });

  it("returns USER_INACTIVE when user exists but isActive=false", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT", false) as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "PUBLISHED") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("USER_INACTIVE");
  });
});

describe("evaluateCourseAccess – course not found", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns COURSE_NOT_FOUND when course does not exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("COURSE_NOT_FOUND");
  });
});

describe("evaluateCourseAccess – ADMIN bypass", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ADMIN can access published paid course without enrollment", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("ADMIN") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("ADMIN");
    expect(d.isAdmin).toBe(true);
  });

  it("ADMIN can access DRAFT course", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("ADMIN") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "DRAFT") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("ADMIN");
    expect(d.courseStatus).toBe("DRAFT");
  });

  it("ADMIN can access ARCHIVED course", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("ADMIN") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "ARCHIVED") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("ADMIN");
  });

  it("ADMIN bypass does NOT hit the enrollment table", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("ADMIN") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);

    await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(prisma.enrollment.findUnique).not.toHaveBeenCalled();
  });
});

describe("evaluateCourseAccess – INSTRUCTOR bypass", () => {
  beforeEach(() => vi.clearAllMocks());

  it("assigned instructor can access their published paid course without enrollment", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("INSTRUCTOR") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(
      mkCourse(999, "PUBLISHED", [USER_ID]) as any
    );

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("INSTRUCTOR");
    expect(d.isInstructor).toBe(true);
  });

  it("assigned instructor can preview their own DRAFT course", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("INSTRUCTOR") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(
      mkCourse(500, "DRAFT", [USER_ID]) as any
    );

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("INSTRUCTOR");
  });

  it("instructor NOT assigned to this course is denied a paid published course (purchase required)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("INSTRUCTOR") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(
      mkCourse(999, "PUBLISHED", ["other-instructor"]) as any
    );
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("PURCHASE_REQUIRED");
    expect(d.isInstructor).toBe(false);
  });

  it("instructor bypass does NOT hit the enrollment table", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("INSTRUCTOR") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(
      mkCourse(999, "DRAFT", [USER_ID]) as any
    );

    await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(prisma.enrollment.findUnique).not.toHaveBeenCalled();
  });
});

describe("evaluateCourseAccess – FREE published course", () => {
  beforeEach(() => vi.clearAllMocks());

  it("free published course grants access to any signed-in student without enrollment", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("FREE_PUBLISHED");
    expect(d.isFree).toBe(true);
  });

  it("free DRAFT course denies non-instructor students", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "DRAFT") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("NOT_PUBLISHED");
  });

  it("free ARCHIVED course denies non-instructor students", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "ARCHIVED") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("NOT_PUBLISHED");
  });
});

describe("evaluateCourseAccess – PAID published course enrollment check", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ACTIVE enrollment grants access", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mkEnrollment("ACTIVE") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("ACTIVE_ENROLLMENT");
    expect(d.hasActiveEnrollment).toBe(true);
  });

  it("COMPLETED enrollment grants lifetime access (course review)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mkEnrollment("COMPLETED") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("ACTIVE_ENROLLMENT");
  });

  it("CANCELLED enrollment is denied (refunded)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mkEnrollment("CANCELLED") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("PURCHASE_REQUIRED");
  });

  it("EXPIRED enrollment is denied", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mkEnrollment("EXPIRED") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("PURCHASE_REQUIRED");
  });

  it("no enrollment at all is denied with PURCHASE_REQUIRED", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("PURCHASE_REQUIRED");
    expect(d.hasActiveEnrollment).toBe(false);
    expect(d.isFree).toBe(false);
  });

  it("paid draft course is denied before enrollment check (NOT_PUBLISHED)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "DRAFT") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("NOT_PUBLISHED");
    // Should short-circuit — no DB enrollment call needed
    expect(prisma.enrollment.findUnique).not.toHaveBeenCalled();
  });
});

describe("canAccessCourseContent – boolean wrapper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns true for admin on any course", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("ADMIN") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "DRAFT") as any);

    expect(await canAccessCourseContent(USER_ID, COURSE_ID)).toBe(true);
  });

  it("returns false for unauthenticated call", async () => {
    expect(await canAccessCourseContent(null, COURSE_ID)).toBe(false);
  });

  it("returns false for student without purchase on paid course", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(500, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    expect(await canAccessCourseContent(USER_ID, COURSE_ID)).toBe(false);
  });
});

describe("assertCourseContentAccess – throws CourseAccessError on denial", () => {
  beforeEach(() => vi.clearAllMocks());

  it("throws with reason PURCHASE_REQUIRED for paid course without enrollment", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    await expect(assertCourseContentAccess(USER_ID, COURSE_ID)).rejects.toThrow(
      CourseAccessError
    );
    await expect(assertCourseContentAccess(USER_ID, COURSE_ID)).rejects.toMatchObject({
      reason: "PURCHASE_REQUIRED"
    });
  });

  it("throws with reason UNAUTHENTICATED for null userId", async () => {
    await expect(assertCourseContentAccess(null, COURSE_ID)).rejects.toMatchObject({
      reason: "UNAUTHENTICATED"
    });
  });

  it("throws with reason NOT_PUBLISHED for draft course accessed by student", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "DRAFT") as any);

    await expect(assertCourseContentAccess(USER_ID, COURSE_ID)).rejects.toMatchObject({
      reason: "NOT_PUBLISHED"
    });
  });

  it("resolves with decision when access is granted", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("ADMIN") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "DRAFT") as any);

    const decision = await assertCourseContentAccess(USER_ID, COURSE_ID);
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("ADMIN");
  });

  it("error message is human-readable and safe (no internal ids)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    try {
      await assertCourseContentAccess(USER_ID, COURSE_ID);
    } catch (err) {
      expect(err).toBeInstanceOf(CourseAccessError);
      expect((err as CourseAccessError).message).toMatch(/purchase required/i);
      expect((err as CourseAccessError).message).not.toContain(USER_ID);
      expect((err as CourseAccessError).message).not.toContain(COURSE_ID);
    }
  });
});

describe("isCourseAccessError – type guard", () => {
  it("returns true for CourseAccessError instances", () => {
    expect(isCourseAccessError(new CourseAccessError("PURCHASE_REQUIRED"))).toBe(true);
  });

  it("returns false for plain Error", () => {
    expect(isCourseAccessError(new Error("oops"))).toBe(false);
  });

  it("returns false for null", () => {
    expect(isCourseAccessError(null)).toBe(false);
  });
});

describe("decision context fields are always populated", () => {
  beforeEach(() => vi.clearAllMocks());

  it("isFree, isPublished, isAdmin, isInstructor are set correctly for allowed admin on paid draft", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("ADMIN") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "DRAFT") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.isFree).toBe(false);
    expect(d.isPublished).toBe(false);
    expect(d.isAdmin).toBe(true);
    expect(d.isInstructor).toBe(false);
    expect(d.courseStatus).toBe("DRAFT");
  });

  it("isFree=true set for free course even when denied (NOT_PUBLISHED)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "DRAFT") as any);

    const d = await evaluateCourseAccess({ userId: USER_ID, courseId: COURSE_ID });
    expect(d.isFree).toBe(true);
    expect(d.isPublished).toBe(false);
    expect(d.allowed).toBe(false);
  });
});
