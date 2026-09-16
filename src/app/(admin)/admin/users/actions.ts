
"use server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: "STUDENT" | "INSTRUCTOR" | "ADMIN") {
    const currentUser = await requireAdmin();

    // 1. Load target user
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) throw new Error("User not found");

    // 2. Safeguard: Admin cannot demote self if target is them
    if (currentUser.id === userId && newRole !== "ADMIN") {
        throw new Error("Cannot demote yourself from Admin role.");
    }

    // 3. Safeguard: Cannot demote the final ADMIN
    if (targetUser.role === "ADMIN" && newRole !== "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
            throw new Error("Cannot demote the last Admin.");
        }
    }

    // 4. Safeguard: Only one ADMIN permitted in this project
    if (newRole === "ADMIN" && targetUser.role !== "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount >= 1) {
            throw new Error("Only one Admin is permitted in this project.");
        }
    }

    // 4. Update
    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
    const currentUser = await requireAdmin();
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!targetUser) throw new Error("User not found");
    // Safeguard: Cannot delete self
    if (currentUser.id === userId) throw new Error("Cannot delete yourself.");
    // Safeguard: Cannot delete Admin
    if (targetUser.role === "ADMIN") throw new Error("Cannot delete Admin.");

    // Manual cascading delete
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