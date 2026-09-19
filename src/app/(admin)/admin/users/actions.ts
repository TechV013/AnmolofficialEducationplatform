"use server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { ADMIN_EMAIL } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export type AssignableRole = "STUDENT" | "INSTRUCTOR";

export async function updateUserRole(userId: string, newRole: AssignableRole) {
    const currentUser = await requireAdmin();

    if (newRole !== "STUDENT" && newRole !== "INSTRUCTOR") {
        throw new Error("Only Student and Instructor roles can be assigned.");
    }

    await prisma.$transaction(async (tx) => {
        const targetUser = await tx.user.findUnique({ where: { id: userId } });
        if (!targetUser) throw new Error("User not found");

        if (currentUser.id === userId) {
            throw new Error("Cannot change your own role.");
        }

        if (targetUser.role === "ADMIN" || targetUser.email === ADMIN_EMAIL) {
            throw new Error("The Admin account role is fixed and cannot be changed.");
        }

        await tx.user.update({
            where: { id: userId },
            data: { role: newRole }
        });
    });

    revalidatePath("/admin/users");
}

export async function toggleBlockUser(userId: string) {
    const currentUser = await requireAdmin();
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!targetUser) throw new Error("User not found");
    if (currentUser.id === userId) throw new Error("Cannot block yourself.");
    if (targetUser.role === "ADMIN") throw new Error("Cannot block the Admin.");
    if (targetUser.email === ADMIN_EMAIL) throw new Error("The Admin account cannot be blocked.");

    await prisma.user.update({
        where: { id: userId },
        data: { isActive: !targetUser.isActive }
    });

    revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
    const currentUser = await requireAdmin();
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!targetUser) throw new Error("User not found");
    if (currentUser.id === userId) throw new Error("Cannot delete yourself.");
    if (targetUser.role === "ADMIN") throw new Error("Cannot delete Admin.");
    if (targetUser.email === ADMIN_EMAIL) throw new Error("The Admin account cannot be deleted.");

    await prisma.$transaction([
        prisma.enrollment.deleteMany({ where: { userId } }),
        prisma.order.deleteMany({ where: { userId } }),
        prisma.quizAttempt.deleteMany({ where: { userId } }),
        prisma.assignmentSubmission.deleteMany({ where: { userId } }),
        prisma.lessonProgress.deleteMany({ where: { userId } }),
        prisma.note.deleteMany({ where: { userId } }),
        prisma.review.deleteMany({ where: { userId } }),
        prisma.courseInstructor.deleteMany({ where: { userId } }),
        prisma.certificate.deleteMany({ where: { userId } }),
        prisma.user.delete({ where: { id: userId } })
    ]);

    revalidatePath("/admin/users");
}