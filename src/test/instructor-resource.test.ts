
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createResource, updateResource, deleteResource } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseInstructor: { findUnique: vi.fn() },
    resource: { create: vi.fn(), update: vi.fn(), delete: vi.fn() }
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

    it("authorized instructor can create resource", async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "instr-1", role: "INSTRUCTOR" } as any);
        vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue({ courseId: "c1", userId: "instr-1" } as any);
        
        await createResource("lesson-1", "Resource", "PDF", "http://a.com", "c1");
        
        expect(prisma.resource.create).toHaveBeenCalled();
    });

    it("unauthorized instructor denied create", async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({ id: "instr-2", role: "INSTRUCTOR" } as any);
        vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue(null);
        
        await expect(createResource("lesson-1", "Resource", "PDF", "http://a.com", "c1")).rejects.toThrow("Forbidden");
    });
});
