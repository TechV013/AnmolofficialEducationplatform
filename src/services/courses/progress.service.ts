import { prisma } from "@/lib/prisma";
import { EnrollmentStatus } from "@prisma/client";

export type CourseProgress = "IN_PROGRESS" | "COMPLETED";

export const getUserCourseProgress = async (
  userId: string,
  courseIds: string[]
): Promise<Map<string, CourseProgress>> => {
  const result = new Map<string, CourseProgress>();
  if (courseIds.length === 0) return result;

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId, courseId: { in: courseIds } },
      select: { courseId: true, status: true }
    });
    if (enrollments.length === 0) return result;

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    const courses = await prisma.course.findMany({
      where: { id: { in: enrolledCourseIds } },
      include: { modules: { include: { lessons: { select: { id: true } } } } }
    });

    const lessonIdsByCourse = new Map<string, string[]>();
    const courseLessonCount = new Map<string, number>();
    const allLessonIds: string[] = [];
    for (const c of courses) {
      const lessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
      lessonIdsByCourse.set(c.id, lessonIds);
      courseLessonCount.set(c.id, lessonIds.length);
      allLessonIds.push(...lessonIds);
    }

    const completions = await prisma.lessonProgress.findMany({
      where: { userId, completed: true, lessonId: { in: allLessonIds } },
      select: { lesson: { include: { module: true } } }
    });

    const completedByCourse = new Map<string, number>();
    for (const p of completions) {
      const courseId = p.lesson.module.courseId;
      completedByCourse.set(courseId, (completedByCourse.get(courseId) ?? 0) + 1);
    }

    const statusByCourse = new Map(enrollments.map((e) => [e.courseId, e.status]));

    for (const courseId of enrolledCourseIds) {
      if (statusByCourse.get(courseId) === EnrollmentStatus.COMPLETED) {
        result.set(courseId, "COMPLETED");
        continue;
      }
      const total = courseLessonCount.get(courseId) ?? 0;
      const done = completedByCourse.get(courseId) ?? 0;
      result.set(courseId, total > 0 && done >= total ? "COMPLETED" : "IN_PROGRESS");
    }

    return result;
  } catch (e) {
    console.warn("getUserCourseProgress: DB unreachable, returning empty map:", e);
    return result;
  }
};