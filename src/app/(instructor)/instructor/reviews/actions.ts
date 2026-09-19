"use server";
import { prisma } from "@/lib/prisma";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { revalidatePath } from "next/cache";

export async function updateReviewReply(reviewId: string, reply: string | null) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { courseId: true }
  });
  if (!review) throw new Error("Review not found");

  const editor = await requireCourseEditor(review.courseId);
  const trimmed = reply?.trim() ?? "";

  await prisma.review.update({
    where: { id: reviewId },
    data: trimmed
      ? { reply: trimmed, repliedAt: new Date(), repliedById: editor.id }
      : { reply: null, repliedAt: null, repliedById: null }
  });

  revalidatePath("/instructor/reviews");
}