import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    lesson: { findFirst: vi.fn() },
    quiz: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn() },
    question: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    option: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

vi.mock("@/lib/auth/authorizer", () => ({
  requireCourseEditor: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import {
  createQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
} from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { prisma } from "@/lib/prisma";

const asEditor = { id: "instr-1", role: "INSTRUCTOR" } as any;
const forbidden = new Error("Forbidden: You do not have permission to edit this course.");

describe("Quiz authoring (Course Studio integration — existing canonical actions)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireCourseEditor).mockResolvedValue(asEditor);
  });

  it("creates a quiz bound to the correct lesson/course (Lesson -> Quiz 1:1)", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "l1" } as any);
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue(null as any);
    vi.mocked(prisma.quiz.create).mockResolvedValue({} as any);

    await createQuiz("l1", "c1");

    expect(prisma.lesson.findFirst).toHaveBeenCalledWith({ where: { id: "l1", module: { courseId: "c1" } } });
    expect(prisma.quiz.create).toHaveBeenCalledWith({ data: { lessonId: "l1" } });
  });

  it("prevents a duplicate quiz on the same lesson", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue({ id: "l1" } as any);
    vi.mocked(prisma.quiz.findUnique).mockResolvedValue({ id: "q1" } as any);

    await expect(createQuiz("l1", "c1")).rejects.toThrow("already exists");
    expect(prisma.quiz.create).not.toHaveBeenCalled();
  });

  it("refuses a quiz for a lesson outside the course", async () => {
    vi.mocked(prisma.lesson.findFirst).mockResolvedValue(null as any);

    await expect(createQuiz("l-other", "c1")).rejects.toThrow("Forbidden");
    expect(prisma.quiz.create).not.toHaveBeenCalled();
  });

  it("student cannot create a quiz", async () => {
    vi.mocked(requireCourseEditor).mockRejectedValue(forbidden);

    await expect(createQuiz("l1", "c1")).rejects.toThrow("Forbidden");
    expect(prisma.quiz.create).not.toHaveBeenCalled();
  });

  it("adds a question to a quiz owned by the course", async () => {
    vi.mocked(prisma.quiz.findFirst).mockResolvedValue({ id: "q1" } as any);
    vi.mocked(prisma.question.create).mockResolvedValue({} as any);

    await addQuestion("q1", "What is 2+2?", "c1");

    expect(prisma.quiz.findFirst).toHaveBeenCalledWith({
      where: { id: "q1", lesson: { module: { courseId: "c1" } } },
    });
    expect(prisma.question.create).toHaveBeenCalledWith({ data: { quizId: "q1", text: "What is 2+2?" } });
  });

  it("updates a question only within the course", async () => {
    vi.mocked(prisma.question.findFirst).mockResolvedValue({ id: "qn1" } as any);
    vi.mocked(prisma.question.update).mockResolvedValue({} as any);

    await updateQuestion("qn1", "Updated question", "c1");

    expect(prisma.question.findFirst).toHaveBeenCalledWith({
      where: { id: "qn1", quiz: { lesson: { module: { courseId: "c1" } } } },
    });
    expect(prisma.question.update).toHaveBeenCalledWith({ where: { id: "qn1" }, data: { text: "Updated question" } });
  });

  it("deletes a question only within the course", async () => {
    vi.mocked(prisma.question.findFirst).mockResolvedValue({ id: "qn1" } as any);
    vi.mocked(prisma.question.delete).mockResolvedValue({} as any);

    await deleteQuestion("qn1", "c1");

    expect(prisma.question.delete).toHaveBeenCalledWith({ where: { id: "qn1" } });
  });

  it("instructor cannot mutate a question in another course", async () => {
    vi.mocked(prisma.question.findFirst).mockResolvedValue(null as any);

    await expect(updateQuestion("qn-other", "hack", "c1")).rejects.toThrow("Forbidden");
    await expect(deleteQuestion("qn-other", "c1")).rejects.toThrow("Forbidden");
    expect(prisma.question.update).not.toHaveBeenCalled();
    expect(prisma.question.delete).not.toHaveBeenCalled();
  });

  it("adds an option to a question owned by the course", async () => {
    vi.mocked(prisma.question.findFirst).mockResolvedValue({ id: "qn1" } as any);
    vi.mocked(prisma.option.create).mockResolvedValue({} as any);

    await addOption("qn1", "Four", true, "c1");

    expect(prisma.option.create).toHaveBeenCalledWith({ data: { questionId: "qn1", text: "Four", isCorrect: true } });
  });

  it("sets and toggles the correct option", async () => {
    vi.mocked(prisma.option.findFirst).mockResolvedValue({ id: "o1" } as any);
    vi.mocked(prisma.option.update).mockResolvedValue({} as any);

    await updateOption("o1", "Four", true, "c1");
    expect(prisma.option.update).toHaveBeenCalledWith({ where: { id: "o1" }, data: { text: "Four", isCorrect: true } });

    await updateOption("o1", "Five", false, "c1");
    expect(prisma.option.update).toHaveBeenCalledWith({ where: { id: "o1" }, data: { text: "Five", isCorrect: false } });
  });

  it("deletes an option only within the course", async () => {
    vi.mocked(prisma.option.findFirst).mockResolvedValue({ id: "o1" } as any);
    vi.mocked(prisma.option.delete).mockResolvedValue({} as any);

    await deleteOption("o1", "c1");

    expect(prisma.option.findFirst).toHaveBeenCalledWith({
      where: { id: "o1", question: { quiz: { lesson: { module: { courseId: "c1" } } } } },
    });
    expect(prisma.option.delete).toHaveBeenCalledWith({ where: { id: "o1" } });
  });

  it("instructor cannot mutate an option in another course", async () => {
    vi.mocked(prisma.option.findFirst).mockResolvedValue(null as any);

    await expect(updateOption("o-other", "x", true, "c1")).rejects.toThrow("Forbidden");
    await expect(deleteOption("o-other", "c1")).rejects.toThrow("Forbidden");
    expect(prisma.option.update).not.toHaveBeenCalled();
    expect(prisma.option.delete).not.toHaveBeenCalled();
  });

  it("student cannot use instructor quiz mutation actions", async () => {
    vi.mocked(requireCourseEditor).mockRejectedValue(forbidden);

    await expect(addQuestion("q1", "Q", "c1")).rejects.toThrow("Forbidden");
    await expect(addOption("qn1", "O", true, "c1")).rejects.toThrow("Forbidden");
    await expect(updateOption("o1", "O", true, "c1")).rejects.toThrow("Forbidden");
    expect(prisma.question.create).not.toHaveBeenCalled();
    expect(prisma.option.create).not.toHaveBeenCalled();
  });
});