import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    course: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    courseInstructor: { findUnique: vi.fn(), create: vi.fn() },
    lesson: { findFirst: vi.fn() },
    assignment: { findUnique: vi.fn(), create: vi.fn() },
    assignmentSubmission: { findFirst: vi.fn(), update: vi.fn() },
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
  createCourse,
  updateCourse,
  createAssignment,
  gradeSubmission,
} from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { getCurrentUser } from "@/lib/auth/helpers";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { prisma } from "@/lib/prisma";

function courseForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  const defaults: Record<string, string> = {
    title: "My Course",
    description: "A great course",
    price: "999",
    category: "Design",
    level: "Beginner",
    thumbnail: "",
    slug: "",
  };
  for (const [k, v] of Object.entries({ ...defaults, ...overrides })) form.append(k, v);
  return form;
}

describe("Instructor course authoring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "instr-1", role: "INSTRUCTOR" } as any);
    vi.mocked(requireCourseEditor).mockResolvedValue({ id: "instr-1", role: "INSTRUCTOR" } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "INSTRUCTOR", isActive: true } as any);
    vi.mocked(prisma.course.findUnique).mockResolvedValue(null as any);
  });

  it("instructor can create a course and becomes its author", async () => {
    vi.mocked(prisma.course.create).mockResolvedValue({ id: "c1", slug: "my-course" } as any);
    vi.mocked(prisma.courseInstructor.create).mockResolvedValue({} as any);

    const id = await createCourse(courseForm({ title: "My Course" }));

    expect(id).toBe("c1");
    expect(prisma.course.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: "My Course", slug: "my-course", status: "DRAFT" }),
    });
    expect(prisma.courseInstructor.create).toHaveBeenCalledWith({
      data: { courseId: "c1", userId: "instr-1" },
    });
  });

  it("students cannot create courses", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "STUDENT", isActive: true } as any);

    await expect(createCourse(courseForm())).rejects.toThrow("Forbidden");
    expect(prisma.course.create).not.toHaveBeenCalled();
  });

  it("duplicate slug is rejected", async () => {
    vi.mocked(prisma.course.findUnique).mockResolvedValue({ id: "existing" } as any);

    await expect(createCourse(courseForm({ title: "My Course" }))).rejects.toThrow("already exists");
    expect(prisma.course.create).not.toHaveBeenCalled();
  });

  it("inactive instructor is denied", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "INSTRUCTOR", isActive: false } as any);

    await expect(createCourse(courseForm())).rejects.toThrow("Forbidden");
  });
});

describe("Instructor course settings + grading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCourseEditor).mockResolvedValue({ id: "instr-1", role: "INSTRUCTOR" } as any);
  });

  it("editor can update course settings with unique slug", async () => {
    vi.mocked(prisma.course.findFirst).mockResolvedValue(null as any);
    vi.mocked(prisma.course.update).mockResolvedValue({ id: "c1", slug: "new-slug" } as any);

    const id = await updateCourse("c1", {
      title: "New Title",
      description: "desc",
      category: "Design",
      level: "Intermediate",
      thumbnail: "",
      slug: "new-slug",
    });

    expect(id).toBe("c1");
    expect(prisma.course.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: expect.objectContaining({ title: "New Title", slug: "new-slug" }),
    });
  });

  it("unassigned instructor cannot edit a course", async () => {
    vi.mocked(requireCourseEditor).mockRejectedValue(new Error("Forbidden: You do not have permission to edit this course."));

    await expect(updateCourse("c2", { title: "X", description: "", category: "", level: "", thumbnail: "", slug: "" }))
      .rejects.toThrow("Forbidden");
    expect(prisma.course.update).not.toHaveBeenCalled();
  });

  it("instructor can create an assignment with an optional due date", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "l1" } as any);
    vi.mocked(prisma.assignment.findUnique).mockResolvedValue(null as any);
    vi.mocked(prisma.assignment.create).mockResolvedValue({} as any);

    await createAssignment("l1", "Build a project", "2026-12-31", "c1");

    expect(prisma.lesson.findFirst).toHaveBeenCalledWith({
      where: { id: "l1", module: { courseId: "c1" } },
    });
    expect(prisma.assignment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        lessonId: "l1",
        instructions: "Build a project",
        dueDate: expect.any(Date) as Date,
      }),
    });
  });

  it("instructor can grade a submission owned by their course", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue({ id: "s1" } as any);
    vi.mocked(prisma.assignmentSubmission.update).mockResolvedValue({} as any);

    await gradeSubmission("s1", "c1", 8, "Great work!");

    expect(prisma.assignmentSubmission.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: expect.objectContaining({ score: 8, feedback: "Great work!", status: "REVIEWED" }),
    });
  });

  it("cannot grade a submission from another course", async () => {
    vi.mocked(prisma.assignmentSubmission.findFirst).mockResolvedValue(null as any);

    await expect(gradeSubmission("s-other", "c1", 5, "hi")).rejects.toThrow("Forbidden");
    expect(prisma.assignmentSubmission.update).not.toHaveBeenCalled();
  });
});