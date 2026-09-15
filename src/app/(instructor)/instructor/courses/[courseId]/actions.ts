"use server";
import { prisma } from "@/lib/prisma";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { requireRole } from "@/lib/auth/helpers";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

function checkAuth(courseId: string) {
    return requireCourseEditor(courseId);
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


// Quiz Authoring Actions (server-authoritative: isCorrect set server-side via separate option creation)
export async function createQuiz(lessonId: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.quiz.create({
        data: { lessonId }
    });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteQuiz(quizId: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.quiz.delete({ where: { id: quizId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function addQuestion(quizId: string, text: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.question.create({ data: { quizId, text } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteQuestion(questionId: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.question.delete({ where: { id: questionId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function addOption(questionId: string, text: string, isCorrect: boolean, courseId: string) {
    await checkAuth(courseId);
    await prisma.option.create({ data: { questionId, text, isCorrect } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteOption(optionId: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.option.delete({ where: { id: optionId } });
    revalidatePath(`/instructor/courses/${courseId}`);
}