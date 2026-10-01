import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import {
  createResource,
  updateResource,
  deleteResource,
  createLesson,
  createQuiz,
  createAssignmentLesson,
  deleteLesson
} from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import {
  isAllowedResourceExtension,
  isUploadedFilePath,
  isValidResourceUrl
} from "@/lib/resource/validateResourceUrl";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    courseInstructor: { findUnique: vi.fn() },
    module: { findFirst: vi.fn() },
    lesson: { count: vi.fn(), aggregate: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    quiz: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    resource: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn()
  }
}));

vi.mock("@/lib/auth/helpers", () => ({
  getCurrentUser: vi.fn()
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

const COURSE_ID = "c1";

function signInAsCourseEditor() {
  vi.mocked(getCurrentUser).mockResolvedValue({ id: "instr-1", role: "INSTRUCTOR" } as any);
  vi.mocked(prisma.courseInstructor.findUnique).mockResolvedValue({ courseId: COURSE_ID, userId: "instr-1" } as any);
}

function lessonInCourse() {
  vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "lesson-1", module: { id: "m1", courseId: COURSE_ID } } as any);
}

function resourceInCourse() {
  vi.mocked(prisma.resource.findFirst).mockResolvedValue({ id: "r1", lesson: { id: "lesson-1", module: { courseId: COURSE_ID } } } as any);
}

describe("Resource lesson authoring (Course Studio — existing canonical Resource model/actions)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.resource.create).mockResolvedValue({} as any);
    vi.mocked(prisma.resource.update).mockResolvedValue({} as any);
    vi.mocked(prisma.resource.delete).mockResolvedValue({} as any);
  });

  // 1 + 7 + 8 + 9: create attaches to the intended lesson/module/course
  it("authorized instructor creates a resource attached to the correct lesson", async () => {
    signInAsCourseEditor();
    lessonInCourse();

    await createResource("lesson-1", "Java Cheat Sheet", "PDF", "/uploads/1-cheatsheet.pdf", COURSE_ID);

    expect(prisma.lesson.findFirst).toHaveBeenCalledWith({
      where: { id: "lesson-1", module: { courseId: COURSE_ID } }
    });
    expect(prisma.resource.create).toHaveBeenCalledWith({
      data: { lessonId: "lesson-1", title: "Java Cheat Sheet", type: "PDF", url: "/uploads/1-cheatsheet.pdf" }
    });
  });

  it("trims title and url before persisting", async () => {
    signInAsCourseEditor();
    lessonInCourse();

    await createResource("lesson-1", "  Notes  ", "DOCUMENT", "  /uploads/notes.docx  ", COURSE_ID);

    expect(prisma.resource.create).toHaveBeenCalledWith({
      data: { lessonId: "lesson-1", title: "Notes", type: "DOCUMENT", url: "/uploads/notes.docx" }
    });
  });

  it("rejects a resource on a lesson outside the authorized course", async () => {
    signInAsCourseEditor();
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue(null);

    await expect(createResource("lesson-other", "Stolen", "PDF", "/uploads/a.pdf", COURSE_ID)).rejects.toThrow("Forbidden");
    expect(prisma.resource.create).not.toHaveBeenCalled();
  });

  // 2: edit
  it("authorized instructor edits a resource within the course", async () => {
    signInAsCourseEditor();
    resourceInCourse();

    await updateResource("r1", "Updated Title", "PROJECT_FILE", "/uploads/project.zip", COURSE_ID);

    expect(prisma.resource.findFirst).toHaveBeenCalledWith({
      where: { id: "r1", lesson: { module: { courseId: COURSE_ID } } }
    });
    expect(prisma.resource.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { title: "Updated Title", type: "PROJECT_FILE", url: "/uploads/project.zip" }
    });
  });

  it("editing a resource in another course is denied", async () => {
    signInAsCourseEditor();
    vi.mocked(prisma.resource.findFirst).mockResolvedValue(null);

    await expect(updateResource("r-other", "Hijack", "PDF", "/uploads/a.pdf", COURSE_ID)).rejects.toThrow("Forbidden");
    expect(prisma.resource.update).not.toHaveBeenCalled();
  });

  it("rejects an invalid url on edit", async () => {
    signInAsCourseEditor();
    resourceInCourse();

    await expect(updateResource("r1", "Bad", "EXTERNAL_LINK", "javascript:alert(1)", COURSE_ID)).rejects.toThrow("Invalid resource URL");
    expect(prisma.resource.update).not.toHaveBeenCalled();
  });

  // 3: delete
  it("authorized instructor deletes a resource within the course", async () => {
    signInAsCourseEditor();
    resourceInCourse();

    await deleteResource("r1", COURSE_ID);

    expect(prisma.resource.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
  });

  it("deleting a resource in another course is denied", async () => {
    signInAsCourseEditor();
    vi.mocked(prisma.resource.findFirst).mockResolvedValue(null);

    await expect(deleteResource("r-other", COURSE_ID)).rejects.toThrow("Forbidden");
    expect(prisma.resource.delete).not.toHaveBeenCalled();
  });

  // 10: invalid url rejection
  it.each([
    ["empty", ""],
    ["plain text", "not a url"],
    ["javascript scheme", "javascript:alert(1)"],
    ["ftp scheme", "ftp://files.example.com/a.pdf"],
    ["upload path traversal", "/uploads/../etc/passwd"]
  ])("rejects %s resource url", async (_label, url) => {
    signInAsCourseEditor();
    lessonInCourse();

    await expect(createResource("lesson-1", "Bad", "EXTERNAL_LINK", url, COURSE_ID)).rejects.toThrow("Invalid resource URL");
    expect(prisma.resource.create).not.toHaveBeenCalled();
  });

  it("requires a title", async () => {
    signInAsCourseEditor();
    lessonInCourse();

    await expect(createResource("lesson-1", "   ", "PDF", "/uploads/a.pdf", COURSE_ID)).rejects.toThrow("title is required");
  });

  // 11: file reference integrity
  it("rejects an uploaded file whose extension contradicts the chosen type", async () => {
    signInAsCourseEditor();
    lessonInCourse();

    await expect(createResource("lesson-1", "Sheet", "PDF", "/uploads/notes.txt", COURSE_ID)).rejects.toThrow("does not match");
    expect(prisma.resource.create).not.toHaveBeenCalled();
  });

  it.each([
    ["PDF", "/uploads/1-cheatsheet.pdf"],
    ["DOCUMENT", "/uploads/notes.docx"],
    ["DOCUMENT", "/uploads/notes.md"],
    ["PROJECT_FILE", "/uploads/project.zip"]
  ] as const)("accepts %s upload %s", async (type, url) => {
    signInAsCourseEditor();
    lessonInCourse();

    await createResource("lesson-1", "Doc", type, url, COURSE_ID);

    expect(prisma.resource.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type, url }) })
    );
  });

  it("accepts an absolute external link without extension checks", async () => {
    signInAsCourseEditor();
    lessonInCourse();

    await createResource("lesson-1", "Docs", "EXTERNAL_LINK", "https://docs.google.com/document/d/abc", COURSE_ID);

    expect(prisma.resource.create).toHaveBeenCalled();
  });

  it("accepts an absolute public file link for a PDF resource", async () => {
    signInAsCourseEditor();
    lessonInCourse();

    await createResource("lesson-1", "Public PDF", "PDF", "https://example.com/files/handbook.pdf", COURSE_ID);

    expect(prisma.resource.create).toHaveBeenCalled();
  });

  // 5 + 6: role authorization
  it("student cannot mutate resources", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "student-1", role: "STUDENT" } as any);
    lessonInCourse();
    resourceInCourse();

    await expect(createResource("lesson-1", "X", "PDF", "/uploads/a.pdf", COURSE_ID)).rejects.toThrow("Forbidden");
    await expect(updateResource("r1", "X", "PDF", "/uploads/a.pdf", COURSE_ID)).rejects.toThrow("Forbidden");
    await expect(deleteResource("r1", COURSE_ID)).rejects.toThrow("Forbidden");
    expect(prisma.resource.create).not.toHaveBeenCalled();
    expect(prisma.resource.update).not.toHaveBeenCalled();
    expect(prisma.resource.delete).not.toHaveBeenCalled();
  });

  it("unauthenticated request is denied", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(createResource("lesson-1", "X", "PDF", "/uploads/a.pdf", COURSE_ID)).rejects.toThrow("Unauthorized");
    await expect(updateResource("r1", "X", "PDF", "/uploads/a.pdf", COURSE_ID)).rejects.toThrow("Unauthorized");
    await expect(deleteResource("r1", COURSE_ID)).rejects.toThrow("Unauthorized");
  });

  it("admin may manage course resources", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: "admin-1", role: "ADMIN" } as any);
    lessonInCourse();
    resourceInCourse();

    await createResource("lesson-1", "Admin PDF", "PDF", "/uploads/a.pdf", COURSE_ID);
    await deleteResource("r1", COURSE_ID);

    expect(prisma.resource.create).toHaveBeenCalled();
    expect(prisma.resource.delete).toHaveBeenCalled();
  });

  // Data integrity: no orphan resources when the lesson is removed
  it("deleting a lesson leaves no orphan resource rows", async () => {
    signInAsCourseEditor();
    vi.mocked(prisma.lesson.delete).mockResolvedValue({} as any);

    await deleteLesson("lesson-1", COURSE_ID);

    expect(prisma.lesson.delete).toHaveBeenCalledWith({ where: { id: "lesson-1" } });
  });

  // 13 + 14 + 15: existing lesson types stay functional
  it("video lesson creation still works", async () => {
    signInAsCourseEditor();
    vi.mocked(prisma.lesson.aggregate).mockResolvedValue({ _max: { position: 1 } } as any);
    vi.mocked(prisma.lesson.create).mockResolvedValue({ id: "lesson-v" } as any);

    const lessonId = await createLesson("m1", "Intro", "desc", "10:00", "https://youtu.be/x", COURSE_ID);

    expect(lessonId).toBe("lesson-v");
    expect(prisma.lesson.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ moduleId: "m1", videoUrl: "https://youtu.be/x", position: 2 }) })
    );
  });

  it("quiz lesson creation still works", async () => {
    signInAsCourseEditor();
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "lesson-q" } as any);
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.quiz.create).mockResolvedValue({ id: "quiz-1" } as any);

    await createQuiz("lesson-q", COURSE_ID);

    expect(prisma.quiz.create).toHaveBeenCalledWith({ data: { lessonId: "lesson-q" } });
  });

  it("assignment lesson creation still works", async () => {
    signInAsCourseEditor();
    vi.mocked(prisma.module.findFirst).mockResolvedValue({ id: "m1", courseId: COURSE_ID } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      await cb({
        lesson: {
          aggregate: vi.fn().mockResolvedValue({ _max: { position: 0 } }),
          count: vi.fn().mockResolvedValue(0),
          create: vi.fn().mockResolvedValue({ id: "lesson-a" })
        }
      });
      return [];
    });

    await createAssignmentLesson("m1", "Task", "desc", "Submit your work", null, COURSE_ID);

    expect(prisma.module.findFirst).toHaveBeenCalledWith({ where: { id: "m1", courseId: COURSE_ID } });
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});

describe("Resource URL / file reference validation", () => {
  it("recognizes upload paths", () => {
    expect(isUploadedFilePath("/uploads/1-file.pdf")).toBe(true);
    expect(isUploadedFilePath("https://example.com/a.pdf")).toBe(false);
  });

  it.each([
    ["https://example.com/a.pdf", true],
    ["http://example.com/a.pdf", true],
    ["/uploads/1-a.pdf", true],
    ["", false],
    ["not a url", false],
    ["javascript:alert(1)", false],
    ["ftp://example.com/a.pdf", false],
    ["/uploads/", false],
    ["/uploads/../secret", false]
  ])("isValidResourceUrl(%s) === %s", (url, expected) => {
    expect(isValidResourceUrl(url)).toBe(expected);
  });

  it("skips extension checks for external links", () => {
    expect(isAllowedResourceExtension("EXTERNAL_LINK", "https://example.com/page")).toBe(true);
  });

  it("enforces extensions for uploaded files", () => {
    expect(isAllowedResourceExtension("PDF", "/uploads/a.pdf")).toBe(true);
    expect(isAllowedResourceExtension("PDF", "/uploads/a.txt")).toBe(false);
    expect(isAllowedResourceExtension("PROJECT_FILE", "/uploads/a.exe")).toBe(false);
  });
});
