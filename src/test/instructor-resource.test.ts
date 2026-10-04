
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createResource, updateResource, deleteResource } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseInstructor: { findUnique: vi.fn() },
    lesson: { findFirst: vi.fn() },
    resource: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    user: { findUnique: vi.fn() }
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Instructor Resource Management", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    /** Session identity only; the DB record is the authority for role/isActive. */
    function signIn(id: string, dbRole: "INSTRUCTOR" | "STUDENT" | "ADMIN") {
        vi.mocked(getCurrentUser).mockResolvedValue({ id, role: dbRole } as any);
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: dbRole, isActive: true } as any);
    }

    it("authorized instructor can create resource", async () => {
        signIn("instr-1", "INSTRUCTOR");
        vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue({ courseId: "c1", userId: "instr-1" } as any);
        vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "lesson-1", module: { courseId: "c1" } } as any);

        await createResource("lesson-1", "Resource", "PDF", "http://a.com", "c1");

        expect(prisma.lesson.findFirst).toHaveBeenCalledWith({
            where: { id: "lesson-1", module: { courseId: "c1" } }
        });
        expect(prisma.resource.create).toHaveBeenCalled();
    });

    it("unauthorized instructor denied create", async () => {
        signIn("instr-2", "INSTRUCTOR");
        vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue(null);

        await expect(createResource("lesson-1", "Resource", "PDF", "http://a.com", "c1")).rejects.toThrow("Forbidden");
        expect(prisma.resource.create).not.toHaveBeenCalled();
    });

    it("instructor cannot attach a resource to a lesson outside the course", async () => {
        signIn("instr-1", "INSTRUCTOR");
        vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue({ courseId: "c1", userId: "instr-1" } as any);
        vi.mocked(prisma.lesson.findFirst).mockResolvedValue(null);

        await expect(createResource("lesson-other", "Resource", "PDF", "http://a.com", "c1")).rejects.toThrow("Forbidden");
        expect(prisma.resource.create).not.toHaveBeenCalled();
    });
});
