import { prisma } from "@/lib/prisma";
import { ACCESS_GRANTING_ENROLLMENT_STATUSES } from "@/services/enrollmentService";

export const createReview = async (userId: string, courseId: string, rating: number, comment: string | null) => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Invalid rating");

    // A cancelled enrollment is not a purchase, so it must not earn a review
    // slot. Previously any row at all passed this check.
    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } },
        select: { status: true }
    });
    if (!enrollment || !(ACCESS_GRANTING_ENROLLMENT_STATUSES as readonly string[]).includes(enrollment.status)) {
        throw new Error("Enroll in this course before writing a review.");
    }

    return await prisma.review.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { rating, comment },
        create: { userId, courseId, rating, comment }
    });
};

export const getCourseReviews = async (courseId: string) => {
    return await prisma.review.findMany({
        where: { courseId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" }
    });
};
