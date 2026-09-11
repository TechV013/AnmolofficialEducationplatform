import { prisma } from "@/lib/prisma";

export const createReview = async (userId: string, courseId: string, rating: number, comment: string | null) => {
    if (rating < 1 || rating > 5) throw new Error("Invalid rating");
    
    // Verify enrollment
    const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
    });
    if (!enrollment) throw new Error("Not enrolled");

    return await prisma.review.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: { rating, comment },
        create: { userId, courseId, rating, comment }
    });
};

export const getCourseReviews = async (courseId: string) => {
    return await prisma.review.findMany({
        where: { courseId },
        include: { user: { select: { name: true } } }
    });
};
