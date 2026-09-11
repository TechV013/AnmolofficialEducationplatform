"use server";
import { prisma } from "@/lib/prisma";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { revalidatePath } from "next/navigation";

// Utility to verify course ownership/access
async function checkAuth(courseId: string) {
    await requireCourseEditor(courseId);
    return courseId;
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
export async function createLesson(moduleId: string, title: string, description: string, courseId: string) {
    await checkAuth(courseId);
    const count = await prisma.lesson.count({ where: { moduleId } });
    await prisma.lesson.create({ data: { moduleId, title, description, position: count } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function updateLesson(id: string, title: string, description: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.lesson.update({ where: { id }, data: { title, description } });
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
export async function createAssignment(lessonId: string, title: string, instructions: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.assignment.create({ data: { lessonId, title, instructions } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
export async function deleteAssignment(id: string, courseId: string) {
    await checkAuth(courseId);
    await prisma.assignment.delete({ where: { id } });
    revalidatePath(`/instructor/courses/${courseId}`);
}

// Publishing
export async function publishCourse(courseId: string) {
    await checkAuth(courseId);
    await prisma.course.update({ where: { id: courseId }, data: { status: "PUBLISHED" } });
    revalidatePath(`/instructor/courses/${courseId}`);
}
