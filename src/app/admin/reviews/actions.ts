"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { revalidatePath } from "next/navigation";

export async function deleteReview(reviewId: string) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");
    
    await prisma.review.delete({ where: { id: reviewId } });
    revalidatePath("/admin/reviews");
}
