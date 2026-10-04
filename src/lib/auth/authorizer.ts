import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./helpers";
import { UserRole } from "@prisma/client";

export async function requireCourseEditor(courseId: string) {
    const user = await getCurrentUser();
    if (!user || !user.id) throw new Error("Unauthorized");

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, isActive: true }
      });

    if (!dbUser || !dbUser.isActive) {
        throw new Error("Forbidden: User not found or inactive.");
    }

    if (dbUser.role === UserRole.ADMIN) {
        return { ...user, role: dbUser.role };
    }

    if (dbUser.role === UserRole.INSTRUCTOR) {
        const assignment = await prisma.courseInstructor.findUnique({
            where: { courseId_userId: { courseId, userId: user.id } }
        });
        if (assignment) return { ...user, role: dbUser.role };
    }

    throw new Error("Forbidden: You do not have permission to edit this course.");
}

export async function requireCourseModuleEditor(courseId: string, moduleId: string) {
    await requireCourseEditor(courseId);
    const mod = await prisma.module.findFirst({
        where: { id: moduleId, courseId }
    });
    if (!mod) {
        throw new Error("Forbidden: Module ownership validation failed");
    }
    return mod;
}

export async function requireCourseLessonEditor(courseId: string, lessonId: string) {
    await requireCourseEditor(courseId);
    const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, module: { courseId } }
    });
    if (!lesson) {
        throw new Error("Forbidden: Lesson ownership validation failed");
    }
    return lesson;
}
