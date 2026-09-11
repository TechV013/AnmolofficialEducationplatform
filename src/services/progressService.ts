import { prisma } from "@/lib/prisma";

export const getLessonProgress = async (userId: string, lessonId: string) => {
  return await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } }
  });
};

export const saveLessonProgress = async (userId: string, lessonId: string, watchedSeconds: number, completed: boolean) => {
  return await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {
      watchedSeconds,
      completed,
      lastWatchedAt: new Date(),
      completedAt: completed ? new Date() : null
    },
    create: {
      userId,
      lessonId,
      watchedSeconds,
      completed
    }
  });
};

export const getCourseProgress = async (userId: string, courseId: string): Promise<number> => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { lessons: true }
      }
    }
  });

  if (!course) return 0;
  
  const allLessons = course.modules.flatMap(m => m.lessons);
  if (allLessons.length === 0) return 0;
  
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lessonId: { in: allLessons.map(l => l.id) }
    }
  });
  
  return Math.round((completedLessons / allLessons.length) * 100);
};

export const getCourseCompletionStatus = async (userId: string, courseId: string) => {
    const progress = await getCourseProgress(userId, courseId);
    
    // Authoritative completion contract
    return {
        completed: progress === 100,
        percentage: progress
    };
};
