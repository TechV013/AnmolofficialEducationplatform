import { prisma } from "@/lib/prisma";
import { getCourseCompletionStatus } from "../progressService";
import { randomUUID } from "crypto";

export const issueCertificate = async (userId: string, courseId: string) => {
    // 1. Verify eligibility (authoritative completion)
    const completion = await getCourseCompletionStatus(userId, courseId);
    if (!completion.completed) throw new Error("Course not completed");

    // 2. Isempotent issuance using unique constraint
    return await prisma.certificate.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: {},
        create: {
            userId,
            courseId,
            certificateNumber: `CERT-${randomUUID().split("-")[0].toUpperCase()}`,
            issuedAt: new Date()
        }
    });
};

export const getCertificate = async (userId: string, courseId: string) => {
    return await prisma.certificate.findUnique({
        where: { userId_courseId: { userId, courseId } },
        include: { course: true, user: { select: { name: true } } }
    });
};
