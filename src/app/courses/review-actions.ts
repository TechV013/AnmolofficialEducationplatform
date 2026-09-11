"use server";
import { createReview } from "@/services/reviews/review.service";
import { getCurrentUser } from "@/lib/auth/helpers";

export async function submitReview(courseId: string, rating: number, comment: string | null) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return await createReview(user.id, courseId, rating, comment);
}
