import { prisma } from "@/lib/prisma";
import { StudentDashboardDTO } from "@/types/dashboard";
import { getCourseProgress } from "../progressService";

export const getStudentDashboard = async (userId: string): Promise<StudentDashboardDTO> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }
  });

  if (!user) throw new Error("User not found");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      course: {
        include: {
          instructors: { include: { user: { select: { name: true } } } },
          modules: { include: { lessons: true } }
        }
      }
    }
  });

  const courses = await Promise.all(enrollments.map(async (en) => {
    const progress = await getCourseProgress(userId, en.courseId);
    
    // Find last lesson
    const lastProgress = await prisma.lessonProgress.findFirst({
        where: { userId, lesson: { moduleId: { in: en.course.modules.map(m => m.id) } } },
        orderBy: { lastWatchedAt: "desc" },
        include: { lesson: true }
    });

    return {
      courseId: en.course.id,
      title: en.course.title,
      thumbnail: en.course.thumbnail,
      instructorName: en.course.instructors[0]?.user.name || null,
      progressPercent: progress,
      lastLessonId: lastProgress?.lessonId || en.course.modules[0]?.lessons[0]?.id || null,
      lastLessonTitle: lastProgress?.lesson.title || en.course.modules[0]?.lessons[0]?.title || null
    };
  }));

  return {
    user: { id: user.id, name: user.name, email: user.email },
    courses,
    summary: { enrolledCourses: enrollments.length }
  };
};
