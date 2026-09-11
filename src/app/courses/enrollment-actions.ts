"use server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { enrollInFreeCourse } from "@/services/enrollmentService";
import { revalidatePath } from "next/cache";

export async function enrollFree(courseId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  await enrollInFreeCourse(user.id, courseId);
  revalidatePath(`/courses/${courseId}`);
}
