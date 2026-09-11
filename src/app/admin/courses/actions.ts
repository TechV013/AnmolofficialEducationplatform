"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { Decimal } from "@prisma/client/runtime/library";

export async function createCourse(data: { title: string; description: string; price: number; category: string; level: string; thumbnail: string; slug: string }) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

    // Validation
    if (!data.title || !data.slug || data.price < 0) throw new Error("Invalid course data");

    return await prisma.course.create({
        data: {
            ...data,
            price: new Decimal(data.price),
            status: "DRAFT"
        }
    });
}
