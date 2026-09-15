import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStudentEnrollmentsForMyLearning } from "@/services/enrollmentService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    enrollment: {
      findMany: vi.fn()
    }
  }
}));

describe("Cross-user isolation (B2.2)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("Student A with enrollment sees Course A; Student B without does NOT", async () => {
    const courseA = { id: "course-a", title: "Course A", status: "PUBLISHED" };
    
    // Student A
    const studentAEnrollments = [
      { id: "enr-a", userId: "user-a", status: "ACTIVE", course: courseA }
    ];
    prisma.enrollment.findMany.mockImplementation(({ where }) => {
      if (where.userId === "user-a") return Promise.resolve(studentAEnrollments);
      return Promise.resolve([]);
    });
    
    const studentAResult = await getStudentEnrollmentsForMyLearning("user-a");
    expect(studentAResult.length).toBeGreaterThan(0);
    expect(studentAResult[0].course.title).toBe("Course A");
    
    // Student B
    const studentBResult = await getStudentEnrollmentsForMyLearning("user-b");
    expect(studentBResult).toEqual([]);
  });
});