"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { requireRole } from "@/lib/auth/helpers";
import { enrollInFreeCourse } from "@/services/enrollmentService";

export async function enrollFree(courseId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  // Require STUDENT role for free enrollment; instructor/admin don't use this path
  if (user.role !== "STUDENT") throw new Error("Forbidden: student enrollment only");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new Error("Course not found");

  // Server-authoritative pricing check; never trust client price/isFree
  const price = Number(course.price ?? 0);
  if (price > 0) throw new Error("Course is not free");
  if (course.status !== "PUBLISHED") throw new Error("Course not published");

  // Idempotent: existing ACTIVE enrollment -> return it; else create
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } }
  });
  if (existing && existing.status === "ACTIVE") {
    return { success: true, id: existing.id, status: existing.status };
  }

  const enrollment = await enrollInFreeCourse(user.id, courseId);
  return { success: true, id: enrollment.id, status: enrollment.status };
}