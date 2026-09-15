import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { hasCourseAccess } from "@/services/enrollmentService";
import { enrollFree } from "@/app/(public)/courses/[courseId]/enrollment-actions";
import { EnrollmentStatus, CourseStatus } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: { findUnique: vi.fn() },
    enrollment: { findUnique: vi.fn(), upsert: vi.fn() }
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
  requireRole: vi.fn()
}));

describe("Student course enrollment vertical slice (B2.1)", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("free course -> server enrollFree succeeds", async () => {
    const mockUser = { id: "user-1", role: "STUDENT", email: "a@a.com", name: "User" };
    const mockCourse = { id: "course-free", price: 0, status: CourseStatus.PUBLISHED };
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.enrollment.upsert).mockResolvedValue({ id: "enr-1", status: EnrollmentStatus.ACTIVE } as any);

    const result = await enrollFree("course-free");
    expect(result).toEqual({ success: true, id: "enr-1", status: "ACTIVE" });
  });

  it("paid course -> enrollFree throws 'Course is not free'", async () => {
    const mockUser = { id: "user-1", role: "STUDENT", email: "a@a.com", name: "User" };
    const mockCourse = { id: "course-paid", price: 999, status: CourseStatus.PUBLISHED };
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any);

    await expect(enrollFree("course-paid")).rejects.toThrow("Course is not free");
  });

  it("repeated free enrollment -> idempotent / returns existing ACTIVE", async () => {
    const mockUser = { id: "user-1", role: "STUDENT", email: "a@a.com", name: "User" };
    const mockCourse = { id: "course-free", price: 0, status: CourseStatus.PUBLISHED };
    const existingEnr = { id: "enr-existing", status: EnrollmentStatus.ACTIVE };
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(mockCourse as any);
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(existingEnr as any);

    const result = await enrollFree("course-free");

    expect(result).toEqual({ success: true, id: "enr-existing", status: "ACTIVE" });
    expect(prisma.enrollment.upsert).not.toHaveBeenCalled();
  });

  it("enrolled student -> hasCourseAccess true", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue({ id: "enr-1", status: EnrollmentStatus.ACTIVE } as any);
    const enrolled = await hasCourseAccess("user-1", "course-1");
    expect(enrolled).toBe(true);
  });

  it("not enrolled -> hasCourseAccess false", async () => {
    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(null);
    const enrolled = await hasCourseAccess("user-1", "course-1");
    expect(enrolled).toBe(false);
  });

  it("unauthenticated -> enrollFree throws 'Unauthorized'", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    await expect(enrollFree("any")).rejects.toThrow("Unauthorized");
  });

  it("non-STUDENT role -> enrollFree throws 'Forbidden'", async () => {
    const mockUser = { id: "user-1", role: "INSTRUCTOR", email: "a@a.com", name: "User" };
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);
    await expect(enrollFree("course-free")).rejects.toThrow("Forbidden");
  });
});