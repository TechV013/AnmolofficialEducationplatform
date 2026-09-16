
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

    // 4. Update
    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath("/admin/users");
}
