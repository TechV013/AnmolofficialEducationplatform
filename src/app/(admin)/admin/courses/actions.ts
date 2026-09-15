"use server";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export async function getAdminCourseData(courseId: string) {
  await authorizeRole("ADMIN");
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: true, instructors: { include: { user: true } } }
  });
}

export async function assignInstructor(courseId: string, userId: string) {
  await authorizeRole("ADMIN");
  return await prisma.courseInstructor.create({
    data: { courseId, userId }
  });
}