import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { hasCourseAccess } from "@/services/enrollmentService";
import { enrollFree } from "@/app/(public)/courses/[courseId]/enrollment-actions";

// Mock modules
vi.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findUnique: vi.fn()
    },
    enrollment: {
      findUnique: vi.fn(),
      upsert: vi.fn()
    }
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
  requireRole: vi.fn()
}));

describe("Student course enrollment vertical slice (B2.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("free course -> server enrollFree succeeds", async () => {
    const mockUser = { id: "user-1", role: "STUDENT" };
    const mockCourse = { id: "course-free", price: 0, status: "PUBLISHED" };
    getCurrentUser.mockResolvedValue(mockUser);
    prisma.course.findUnique.mockResolvedValue(mockCourse);
    prisma.enrollment.findUnique.mockResolvedValue(null); // no existing
    prisma.enrollment.upsert.mockResolvedValue({ id: "enr-1", status: "ACTIVE" });

    const result = await enrollFree("course-free");

    expect(result).toEqual({ success: true, id: "enr-1", status: "ACTIVE" });
    expect(prisma.course.findUnique).toHaveBeenCalledWith({ where: { id: "course-free" } });
    expect(prisma.enrollment.upsert).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: "user-1", courseId: "course-free" } },
      update: { status: "ACTIVE" },
      create: { userId: "user-1", courseId: "course-free", status: "ACTIVE" }
    });
  });

  it("paid course -> enrollFree throws 'Course is not free'", async () => {
    const mockUser = { id: "user-1", role: "STUDENT" };
    const mockCourse = { id: "course-paid", price: 999, status: "PUBLISHED" };
    getCurrentUser.mockResolvedValue(mockUser);
    prisma.course.findUnique.mockResolvedValue(mockCourse);

    await expect(enrollFree("course-paid")).rejects.toThrow("Course is not free");
  });

  it("repeated free enrollment -> idempotent (returns existing ACTIVE)", async () => {
    const mockUser = { id: "user-1", role: "STUDENT" };
    const mockCourse = { id: "course-free", price: 0, status: "PUBLISHED" };
    const existingEnr = { id: "enr-existing", status: "ACTIVE" };
    getCurrentUser.mockResolvedValue(mockUser);
    prisma.course.findUnique.mockResolvedValue(mockCourse);
    prisma.enrollment.findUnique.mockResolvedValue(existingEnr); // existing ACTIVE

    const result = await enrollFree("course-free");

    expect(result).toEqual({ success: true, id: "enr-existing", status: "ACTIVE" });
    expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: "user-1", courseId: "course-free" } }
    });
    expect(prisma.enrollment.upsert).not.toHaveBeenCalled(); // should not upsert
  });

  it("enrolled student -> hasCourseAccess true", async () => {
    const mockUserId = "user-1";
    const mockCourseId = "course-1";
    const mockEnrollment = { id: "enr-1", status: "ACTIVE" };
    prisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);

    const enrolled = await hasCourseAccess(mockUserId, mockCourseId);
    expect(enrolled).toBe(true);
  });

  it("not enrolled -> hasCourseAccess false", async () => {
    prisma.enrollment.findUnique.mockResolvedValue(null);
    const enrolled = await hasCourseAccess("user-1", "course-1");
    expect(enrolled).toBe(false);
  });

  it("unauthenticated -> enrollFree throws 'Unauthorized'", async () => {
    getCurrentUser.mockResolvedValue(null);
    await expect(enrollFree("any")).rejects.toThrow("Unauthorized");
  });

  it("non-STUDENT role -> enrollFree throws 'Forbidden'", async () => {
    const mockUser = { id: "user-1", role: "INSTRUCTOR" };
    getCurrentUser.mockResolvedValue(mockUser);
    await expect(enrollFree("course-free")).rejects.toThrow("Forbidden");
  });
});