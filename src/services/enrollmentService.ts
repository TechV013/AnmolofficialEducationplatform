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

export const getStudentEnrollmentsForMyLearning = async (userId: string) => {
  return await prisma.enrollment.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: { position: 'asc' }
              }
            }
          },
          instructors: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        }
      }
    }
  });
};

export const getFirstUnfinishedLessonForUser = async (userId: string, courseId: string) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: { position: 'asc' },
            include: {
              progress: {
                where: { userId }
              }
            }
          }
        },
        orderBy: { position: 'asc' }
      }
    }
  });
  if (!course) return null;
  
  const allLessons = course.modules.flatMap(m => m.lessons.sort((a,b) => a.position - b.position));
  // Find first lesson where not completed (no progress or completed = false)
  for (const lesson of allLessons) {
    const progress = lesson.progress?.[0];
    if (!progress || !progress.completed) {
      return lesson.id;
    }
  }
  // All completed — return first lesson (for review)
  return allLessons[0]?.id || null;
};