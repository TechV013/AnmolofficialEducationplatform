import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { requireCourseModuleEditor } from "@/lib/auth/authorizer";
import { updateModule } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    module: { update: vi.fn() },
    courseInstructor: { findUnique: vi.fn() },
    lesson: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/auth/authorizer", () => ({
  requireCourseEditor: vi.fn(),
  requireCourseModuleEditor: vi.fn(), // Need to mock this too? Wait, the test calls updateModule which calls requireCourseModuleEditor.
}));

// Actually, requireCourseModuleEditor is NOT imported by actions.ts — it's *used* by it. 
// I should mock it. But actions.ts imports it from "@/lib/auth/authorizer".
// Let me mock requireCourseModuleEditor in tests.

vi.mock("@/lib/auth/authorizer", () => ({
  requireCourseEditor: vi.fn(),
  requireCourseModuleEditor: vi.fn(),
  requireCourseLessonEditor: vi.fn(),
}));

describe("Instructor ownership security", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("prevents instructor from modifying module in another course", async () => {
        // Setup: Instructor A owns Course A
        vi.mocked(requireCourseModuleEditor).mockRejectedValue(new Error("Forbidden"));
        
        // Operation: Instructor A tries to modify Module in Course B
        await expect(updateModule("m-b", "New Title", "c-b"))
            .rejects.toThrow("Forbidden");
        
        expect(prisma.module.update).not.toHaveBeenCalled();
    });
});
