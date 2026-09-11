import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "./helpers";
import { UserRole } from "@prisma/client";

export async function requireCourseEditor(courseId: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    if (user.role === UserRole.ADMIN) return user;

    if (user.role === UserRole.INSTRUCTOR) {
        const assignment = await prisma.courseInstructor.findUnique({
            where: { courseId_userId: { courseId, userId: user.id } }
        });
        if (assignment) return user;
    }

    throw new Error("Forbidden: You do not have permission to edit this course.");
}
