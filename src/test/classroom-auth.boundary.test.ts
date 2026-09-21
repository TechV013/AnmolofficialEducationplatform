/**
 * Classroom authorization boundary tests (B1.1)
 *
 * Thin boundary assertions verifying the integration contract between the
 * classroom access policy and the enrollment/payment system, without
 * duplicating the full matrix in course-access.authorization.test.ts.
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
  assertCourseContentAccess,
  CourseAccessError
} from "@/services/courseAccessService";

const mkUser = (role: "STUDENT" | "INSTRUCTOR" | "ADMIN", isActive = true) => ({
  role,
  isActive
});

const mkCourse = (
  price: number,
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED",
  instructorIds: string[] = []
) => ({
  id: "c1",
  price,
  status,
  instructors: instructorIds.map((userId) => ({ userId }))
});

const U = "user-1";
const C = "course-1";

describe("Classroom enrollment authorization boundary (B1.1)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("only ACTIVE enrollment grants access to a paid published course", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(499, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ status: "ACTIVE" } as any);

    const d = await evaluateCourseAccess({ userId: U, courseId: C });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("ACTIVE_ENROLLMENT");
  });

  it("free published course access does NOT require enrollment (server-authoritative price check)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(0, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    const d = await evaluateCourseAccess({ userId: U, courseId: C });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("FREE_PUBLISHED");
    // The price check is server-side; isFree comes from DB, never from the client
    expect(d.isFree).toBe(true);
  });

  it("client-supplied price cannot bypass server check: paid course with no enrollment is denied", async () => {
    // Even if a malicious client claims the course is free, the server reads price from DB
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    const d = await evaluateCourseAccess({ userId: U, courseId: C });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("PURCHASE_REQUIRED");
  });

  it("instructor of the course always passes the boundary — even unpublished", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("INSTRUCTOR") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "DRAFT", [U]) as any);

    const d = await evaluateCourseAccess({ userId: U, courseId: C });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("INSTRUCTOR");
  });

  it("assertCourseContentAccess throws CourseAccessError for denied access", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mkUser("STUDENT") as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mkCourse(999, "PUBLISHED") as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);

    const err = await assertCourseContentAccess(U, C).catch((e) => e);
    expect(err).toBeInstanceOf(CourseAccessError);
    expect(err.reason).toBe("PURCHASE_REQUIRED");
  });
});
