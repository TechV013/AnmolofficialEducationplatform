import { prisma } from "@/lib/prisma";

export const hasCourseAccess = async (userId: string, courseId: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId
      }
    }
  });
  return !!enrollment && enrollment.status === "ACTIVE";
};

export const enrollInFreeCourse = async (userId: string, courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || Number(course.price) > 0 || course.status !== "PUBLISHED") {
    throw new Error("Course not free or not available");
  }

  return await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId, courseId }
    },
    update: { status: "ACTIVE" },
    create: { userId, courseId, status: "ACTIVE" }
  });
};

export const getUserEnrollments = async (userId: string) => {
    return await prisma.enrollment.findMany({
        where: { userId, status: "ACTIVE" },
        include: { course: true }
    });
};
