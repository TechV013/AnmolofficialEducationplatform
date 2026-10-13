import { prisma } from "@/lib/prisma";
import { StudentDashboardDTO } from "@/types/dashboard";

export const getStudentDashboard = async (userId: string): Promise<StudentDashboardDTO> => {
  const [user, enrollments, userProgress] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    }),
    prisma.enrollment.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        course: {
          include: {
            instructors: { include: { user: { select: { name: true } } } },
            modules: {
              orderBy: { position: "asc" },
              include: {
                lessons: {
                  orderBy: { position: "asc" }
                }
              }
            }
          }
        }
      }
    }),
    prisma.lessonProgress.findMany({
      where: { userId },
      include: { lesson: true }
    })
  ]);

  if (!user) throw new Error("User not found");

  // Create quick lookup maps for in-memory processing
  const progressByLessonId = new Map(userProgress.map((p) => [p.lessonId, p]));

  const courses = enrollments.map((en) => {
    const course = en.course;
    const allLessons = course.modules.flatMap((m) => m.lessons);
    
    // Calculate progress % in-memory without extra DB calls
    let completedCount = 0;
    let latestWatchedProgress: typeof userProgress[0] | null = null;

    for (const lesson of allLessons) {
      const p = progressByLessonId.get(lesson.id);
      if (p?.completed) {
        completedCount++;
      }
      if (p?.lastWatchedAt) {
        if (!latestWatchedProgress || p.lastWatchedAt > latestWatchedProgress.lastWatchedAt) {
          latestWatchedProgress = p;
        }
      }
    }

    const progressPercent = allLessons.length > 0
      ? Math.round((completedCount / allLessons.length) * 100)
      : 0;

    const firstLesson = course.modules[0]?.lessons[0];

    return {
      courseId: course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      instructorName: course.instructors[0]?.user.name || null,
      progressPercent,
      lastLessonId: latestWatchedProgress?.lessonId || firstLesson?.id || null,
      lastLessonTitle: latestWatchedProgress?.lesson.title || firstLesson?.title || null
    };
  });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    courses,
    summary: { enrolledCourses: enrollments.length }
  };
};
