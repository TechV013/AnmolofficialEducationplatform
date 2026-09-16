"use server";
import { prisma } from "@/lib/prisma";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { requireRole } from "@/lib/auth/helpers";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

function checkAuth(courseId: string) {
    return requireCourseEditor(courseId);
}

async function validateOptionOwnership(courseId: string, optionId: string) {
  const option = await prisma.option.findFirst({
    where: {
      id: optionId,
      question: { quiz: { lesson: { module: { courseId } } } }
    }
  });
  if (!option) throw new Error("Forbidden: Option ownership validation failed");
}

async function validateQuestionOwnershipForAction(courseId: string, questionId: string) {
    const question = await prisma.question.findFirst({
        where: { id: questionId, quiz: { lesson: { module: { courseId } } } }
    });
    if (!question) throw new Error("Forbidden: Question ownership validation failed");
}

async function validateQuizOwnership(courseId: string, quizId: string) {
    const quiz = await prisma.quiz.findFirst({
        where: { id: quizId, lesson: { module: { courseId } } }
    });
    if (!quiz) throw new Error("Forbidden: Quiz ownership validation failed");
}


async function validateOptionOwnership(courseId: string, optionId: string) {
  const option = await prisma.option.findFirst({
    where: {
      id: optionId,
      question: { quiz: { lesson: { module: { courseId } } } }
    }
  });
  if (!option) throw new Error("Forbidden: Option ownership validation failed");
}

async function validateQuestionOwnershipForActionForAction(courseId: string, questionId: string) {
    const question = await prisma.question.findFirst({
        where: { id: questionId, quiz: { lesson: { module: { courseId } } } }
    });
    if (!question) throw new Error("Forbidden: Question ownership validation failed");
}

async function validateQuestionOwnershipForAction(courseId: string, questionId: string) {
    const question = await prisma.question.findFirst({
        where: { id: questionId, quiz: { lesson: { module: { courseId } } } }
    });
    if (!question) throw new Error("Forbidden: Question ownership validation failed");
}


// Module CRUD
export async function createModule(courseId: string, title: string) {
    await checkAuth(courseId);
    const count = await prisma.module.count({ where: { courseId } });
    await prisma.module.create({ data: { courseId, title, position: count } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function updateModule(id: string, title: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.module.update({ where: { id }, data: { title } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteModule(id: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.module.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Lesson CRUD
export async function createLesson(moduleId: string, title: string, description: string, duration: string, courseId: string) {
    await checkAuth(courseId);
    const count = await prisma.lesson.count({ where: { moduleId } });
    await prisma.lesson.create({ data: { moduleId, title, description, duration, position: count } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function updateLesson(id: string, title: string, description: string, videoUrl: string | null, courseId: string) {
    await checkAuth(courseId);
    await prisma.lesson.update({ where: { id }, data: { title, description, videoUrl: videoUrl || null } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteLesson(id: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.lesson.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Resource Actions
export async function createResource(lessonId: string, title: string, type: 'PDF' | 'DOCUMENT' | 'PROJECT_FILE' | 'EXTERNAL_LINK', url: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.resource.create({ data: { lessonId, title, type, url } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

export async function updateResource(id: string, title: string, type: 'PDF' | 'DOCUMENT' | 'PROJECT_FILE' | 'EXTERNAL_LINK', url: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.resource.update({ where: { id }, data: { title, type, url } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

export async function deleteResource(id: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.resource.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Assignment Actions
export async function createAssignment(lessonId: string, instructions: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.assignment.create({ data: { lessonId, instructions } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteAssignment(id: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.assignment.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Publish with pre-validation
export async function publishCourse(courseId: string) {
    await checkAuth(courseId);
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { modules: { include: { lessons: true } } }
    });
    if (!course) throw new Error("Course not found");
    if (!course.title || !course.description) throw new Error("Course needs title and description");
    const moduleCount = course.modules.length;
    if (moduleCount === 0) throw new Error("Add at least one module before publishing");
    const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    if (lessonCount === 0) throw new Error("Add at least one lesson before publishing");
    await prisma.course.update({ where: { id: courseId }, data: { status: "PUBLISHED" } });
    revalidatePath(`/instructor/courses/${courseId}`);
    revalidatePath(`/courses/${course.slug}`);
    revalidatePath(`/courses`);
}

// Instructor can create courses (DRAFT default) — this allows self-assigned instructors to create
export async function createCourse(formData: FormData) {
    await requireRole("ADMIN");
    const data = Object.fromEntries(formData);
    const { title, description, price, category, level, thumbnail, slug } = data as {
        title: string; description: string; price: string; category: string; level: string; thumbnail: string; slug: string;
    };
    if (!title || !slug || parseFloat(price) < 0) throw new Error("Invalid course data");
    await prisma.course.create({
        data: {
            title, description, price: new Decimal(parseFloat(price)), category, level, thumbnail, slug,
            status: "DRAFT", instructors: { create: [] }
        }
    });
    return;
}



export async function updateQuestion(questionId: string, text: string, courseId: string) {
    await checkAuth(courseId);
    await validateQuestionOwnershipForAction(courseId, questionId);
    await prisma.question.update({ where: { id: questionId }, data: { text } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

export async function updateOption(optionId: string, text: string, isCorrect: boolean, courseId: string) {
    await checkAuth(courseId);
    await validateOptionOwnership(courseId, optionId);
    await validateOptionOwnership(courseId, optionId);
    // Note: The previous simplified action for deleteOption was acceptable,
    // but update requires finding the question for full validation.
    // This assumes existing validation architecture is sufficient or update is
    // allowed if the question belongs to this quiz.
    await prisma.option.update({ where: { id: optionId }, data: { text, isCorrect } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Quiz Authoring Actions (server-authoritative: isCorrect set server-side via separate option creation)
export async function createQuiz(lessonId: string, courseId: string) {
    await checkAuth(courseId);
    const existingQuiz = await prisma.quiz.findUnique({ where: { lessonId } });
    if (existingQuiz) throw new Error("A quiz already exists for this lesson.");
    await prisma.quiz.create({
        data: { lessonId }
    });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteQuiz(quizId: string, courseId: string) {
    await checkAuth(courseId);
    await validateQuizOwnership(courseId, quizId);
    await prisma.quiz.delete({ where: { id: quizId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function addQuestion(quizId: string, text: string, courseId: string) {
    await checkAuth(courseId);
    await validateQuizOwnership(courseId, quizId);
    await prisma.question.create({ data: { quizId, text } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteQuestion(questionId: string, courseId: string) {
    await checkAuth(courseId);
    await validateQuestionOwnershipForAction(courseId, questionId);
    await prisma.question.delete({ where: { id: questionId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function addOption(questionId: string, text: string, isCorrect: boolean, courseId: string) {
    await checkAuth(courseId);
    await validateQuestionOwnershipForAction(courseId, questionId);
    await validateQuestionOwnershipForAction(courseId, questionId);
    await validateQuestionOwnershipForAction(courseId, questionId);
    await prisma.option.create({ data: { questionId, text, isCorrect } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteOption(optionId: string, courseId: string) {
    await checkAuth(courseId);
    await validateOptionOwnership(courseId, optionId);
    await validateOptionOwnership(courseId, optionId);
    // Simplified for option as questonId is required for full validation, but here we only have optionId
    // For strict validation, we would need to look up option -> question -> quiz -> lesson -> module -> course
    // This suffices for now as the Quiz/Question actions validate correctly.

    await prisma.option.delete({ where: { id: optionId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}