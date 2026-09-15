import { prisma } from "@/lib/prisma";

export async function getAdminCourseData(courseId: string) {
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: true }
  });
}