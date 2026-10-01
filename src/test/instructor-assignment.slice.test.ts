import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    module: { findFirst: vi.fn() },
    lesson: { findFirst: vi.fn(), count: vi.fn(), aggregate: vi.fn(), create: vi.fn() },
    assignment: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth/authorizer", () => ({
  requireCourseEditor: vi.fn(),
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createAssignment,
  createAssignmentLesson,
  updateAssignment,
  deleteAssignment,
} from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { prisma } from "@/lib/prisma";

const asEditor = { id: "instr-1", role: "INSTRUCTOR" } as any;

describe("Assignment authoring (Slice 3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCourseEditor).mockResolvedValue(asEditor);
    // tx === prisma for the transaction mock
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(prisma));
  });

  it("authorized instructor creates an assignment lesson bound to the right module/course", async () => {
    vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: "m1", courseId: "c1" } as any);
    vi.mocked(prisma.lesson.aggregate).mockResolvedValue({ _max: { position: 2 } } as any);
    vi.mocked(prisma.lesson.create).mockResolvedValue({ id: "l1" } as any);

    await createAssignmentLesson("m1", "Practical Assignment", "desc", "Build a capstone", "2026-12-31", "c1");

    expect(prisma.module.findFirst).toHaveBeenCalledWith({ where: { id: "m1", courseId: "c1" } });
    expect(prisma.lesson.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        moduleId: "m1",
        title: "Practical Assignment",
        position: 3,
        assignment: {
          create: { instructions: "Build a capstone", dueDate: expect.any(Date) as Date },
        },
      }),
    });
  });

  it("cannot create an assignment lesson in a module outside the course", async () => {
    vi.mocked(prisma.module.findFirst).mockResolvedValue(null as any);

    await expect(createAssignmentLesson("m-other", "T", "d", "i", null, "c1")).rejects.toThrow("Forbidden");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("student cannot create an assignment lesson", async () => {
    vi.mocked(requireCourseEditor).mockRejectedValue(new Error("Forbidden: You do not have permission to edit this course."));

    await expect(createAssignmentLesson("m1", "T", "d", "i", null, "c1")).rejects.toThrow("Forbidden");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("unauthenticated user is denied", async () => {
    vi.mocked(requireCourseEditor).mockRejectedValue(new Error("Unauthorized"));

    await expect(createAssignmentLesson("m1", "T", "d", "i", null, "c1")).rejects.toThrow("Unauthorized");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("duplicate assignment is protected (nested create throws)", async () => {
    vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: "m1" } as any);
    vi.mocked(prisma.lesson.aggregate).mockResolvedValue({ _max: { position: -1 } } as any);
    vi.mocked(prisma.lesson.create).mockRejectedValue(new Error("Unique constraint failed on lessonId") as any);

    await expect(createAssignmentLesson("m1", "T", "d", "i", null, "c1")).rejects.toThrow("Unique constraint");
  });

  it("authorized instructor edits own assignment", async () => {
    vi.mocked(prisma.assignment.findFirst).mockResolvedValue({ id: "a1" } as any);
    vi.mocked(prisma.assignment.update).mockResolvedValue({} as any);

    await updateAssignment("a1", "Updated instructions", "2026-11-01", "c1");

    expect(prisma.assignment.findFirst).toHaveBeenCalledWith({
      where: { id: "a1", lesson: { module: { courseId: "c1" } } },
    });
    expect(prisma.assignment.update).toHaveBeenCalledWith({
      where: { id: "a1" },
      data: expect.objectContaining({ instructions: "Updated instructions", dueDate: expect.any(Date) as Date }),
    });
  });

  it("instructor cannot edit an assignment in another course", async () => {
    vi.mocked(prisma.assignment.findFirst).mockResolvedValue(null as any);

    await expect(updateAssignment("a-other", "hack", null, "c1")).rejects.toThrow("Forbidden");
    expect(prisma.assignment.update).not.toHaveBeenCalled();
  });

  it("authorized instructor deletes own assignment (lesson remains)", async () => {
    vi.mocked(prisma.assignment.findFirst).mockResolvedValue({ id: "a1" } as any);
    vi.mocked(prisma.assignment.delete).mockResolvedValue({} as any);

    await deleteAssignment("a1", "c1");

    expect(prisma.assignment.findFirst).toHaveBeenCalledWith({
      where: { id: "a1", lesson: { module: { courseId: "c1" } } },
    });
    expect(prisma.assignment.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
  });

  it("instructor cannot delete an assignment from another course", async () => {
    vi.mocked(prisma.assignment.findFirst).mockResolvedValue(null as any);

    await expect(deleteAssignment("a-other", "c1")).rejects.toThrow("Forbidden");
    expect(prisma.assignment.delete).not.toHaveBeenCalled();
  });

  it("student cannot delete an assignment", async () => {
    vi.mocked(requireCourseEditor).mockRejectedValue(new Error("Forbidden: You do not have permission to edit this course."));

    await expect(deleteAssignment("a1", "c1")).rejects.toThrow("Forbidden");
    expect(prisma.assignment.delete).not.toHaveBeenCalled();
  });
});

describe("Existing createAssignment stays compatible (submissions preserved)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCourseEditor).mockResolvedValue(asEditor);
  });

  it("attaches an assignment to the correct lesson/module/course", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "l1" } as any);
    vi.mocked(prisma.assignment.findUnique).mockResolvedValue(null as any);
    vi.mocked(prisma.assignment.create).mockResolvedValue({} as any);

    await createAssignment("l1", "Legacy path", null, "c1");

    expect(prisma.lesson.findFirst).toHaveBeenCalledWith({ where: { id: "l1", module: { courseId: "c1" } } });
    expect(prisma.assignment.create).toHaveBeenCalledWith({
      data: { lessonId: "l1", instructions: "Legacy path", dueDate: null },
    });
  });

  it("refuses a duplicate 1:1 assignment on the same lesson", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "l1" } as any);
    vi.mocked(prisma.assignment.findUnique).mockResolvedValue({ id: "a1" } as any);

    await expect(createAssignment("l1", "again", null, "c1")).rejects.toThrow("already has an assignment");
    expect(prisma.assignment.create).not.toHaveBeenCalled();
  });

  it("refuses to attach an assignment to a lesson outside the course", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue(null as any);

    await expect(createAssignment("l-other", "x", null, "c1")).rejects.toThrow("Forbidden");
    expect(prisma.assignment.create).not.toHaveBeenCalled();
  });
});