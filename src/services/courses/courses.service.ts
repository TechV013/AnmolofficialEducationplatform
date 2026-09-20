import { prisma } from "@/lib/prisma";
import type { Course } from "@/types/lms";
import { mapCourse, CourseWithModules, CourseStats } from "./dtos";
import { courses as staticCourses } from "@/data/courses";

const COURSE_INCLUDE = {
  modules: {
    include: {
      lessons: { include: { resources: true } }
    }
  },
  instructors: { include: { user: { select: { name: true } } } }
} as const;

const getCoursesStats = async (courseIds: string[]): Promise<Map<string, CourseStats>> => {
  const stats = new Map<string, CourseStats>();
  if (courseIds.length === 0) return stats;

  const reviews = await prisma.review.groupBy({
    by: ["courseId"],
    where: { courseId: { in: courseIds } },
    _avg: { rating: true },
    _count: { _all: true }
  });
  for (const r of reviews) {
    stats.set(r.courseId, {
      rating: Math.round((r._avg.rating ?? 0) * 10) / 10,
      reviewsCount: r._count._all
    });
  }

  const enrollments = await prisma.enrollment.groupBy({
    by: ["courseId"],
    where: { courseId: { in: courseIds }, status: "ACTIVE" },
    _count: { _all: true }
  });
  for (const e of enrollments) {
    const existing = stats.get(e.courseId) ?? {};
    stats.set(e.courseId, { ...existing, students: e._count._all });
  }

  return stats;
};

export const getPublishedCourses = async (): Promise<Course[]> => {
  try {
    const courses = (await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: { ...COURSE_INCLUDE }
    })) as unknown as CourseWithModules[];
    const stats = await getCoursesStats(courses.map((c) => c.id));
    return courses.map((course) => mapCourse(course, stats.get(course.id)));
  } catch (e) {
    console.warn("getPublishedCourses: DB unreachable, falling back to static course catalog:", e);
    return staticCourses;
  }
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const course = (await prisma.course.findUnique({
      where: { id: courseId },
      include: { ...COURSE_INCLUDE }
    })) as unknown as CourseWithModules | null;
    if (!course) return null;
    const stats = await getCoursesStats([course.id]);
    return mapCourse(course, stats.get(course.id));
  } catch (e) {
    console.warn(`getCourseById: DB unreachable for courseId ${courseId}, checking static catalog:`, e);
    const found = staticCourses.find((c) => c.id === courseId);
    return found || null;
  }
};