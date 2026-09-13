"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth/helpers";
import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData) {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") throw new Error("Unauthorized");

    const data = Object.fromEntries(formData);
    const { title, description, price, category, level, thumbnail, slug } = data as {
        title: string;
        description: string;
        price: string;
        category: string;
        level: string;
        thumbnail: string;
        slug: string;
    };

    // Validation
    if (!title || !slug || parseFloat(price) < 0) throw new Error("Invalid course data");

    await prisma.course.create({
        data: {
            title,
            description,
            price: new Decimal(parseFloat(price)),
            category,
            level,
            thumbnail,
            slug,
            status: "DRAFT"
        }
    });
    return;
}

export async function assignInstructor(courseId: string, formData: FormData) {
    await requireRole("ADMIN"); // ADMIN only; instructor cannot self-assign
    const userId = String(formData.get("userId") || "");
    if (!userId) throw new Error("Instructor selection is required");

    // Server-side validation: course must exist
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error("Course not found");

    // Target user must be a valid INSTRUCTOR (client-supplied IDs cannot bypass this)
    const instructor = await prisma.user.findFirst({
        where: { id: userId, role: "INSTRUCTOR" }
    });
    if (!instructor) throw new Error("Only instructors can be assigned to courses");

    // Duplicate assignment handled safely (no error, idempotent no-op)
    await prisma.courseInstructor.upsert({
        where: { courseId_userId: { courseId, userId } },
        update: {},
        create: { courseId, userId }
    });
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath(`/admin/courses`);
    revalidatePath(`/instructor/courses/${courseId}`);
}