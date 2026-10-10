import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Course, CourseSummary } from "@/types/lms";
import { mapCourse, mapCourseSummary, CourseWithModules, CourseSummaryRow, CourseStats } from "./dtos";
import { courses as staticCourses } from "@/data/courses";

const COURSE_INCLUDE = {
  modules: {
    include: {
      lessons: { include: { resources: true } }
    }
  },
  instructors: { include: { user: { select: { name: true } } } }
} as const;

// List surfaces only need lesson durations to compute totals — never lesson
// bodies, video URLs, or resources.
const COURSE_SUMMARY_INCLUDE = {
  modules: { select: { lessons: { select: { duration: true } } } },
  instructors: { include: { user: { select: { name: true } } } }
} as const;

export const COURSE_LIST_TAG = "course-summaries";

const getCoursesStats = async (courseIds: string[]): Promise<Map<string, CourseStats>> => {
  const stats = new Map<string, CourseStats>();
  if (courseIds.length === 0) return stats;

  const [reviews, enrollments] = await Promise.all([
    prisma.review.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds } },
      _avg: { rating: true },
      _count: { _all: true }
    }),
    prisma.enrollment.groupBy({
      by: ["courseId"],
      where: { courseId: { in: courseIds }, status: "ACTIVE" },
      _count: { _all: true }
    })
  ]);

  for (const r of reviews) {
    stats.set(r.courseId, {
      rating: Math.round((r._avg.rating ?? 0) * 10) / 10,
      reviewsCount: r._count._all
    });
  }
  // Merge (not overwrite) so rating data set above survives.
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
      orderBy: { createdAt: "desc" },
      include: { ...COURSE_INCLUDE }
    })) as unknown as CourseWithModules[];
    const stats = await getCoursesStats(courses.map((c) => c.id));
    return courses.map((course) => mapCourse(course, stats.get(course.id)));
  } catch (e) {
    console.warn("getPublishedCourses: DB unreachable, falling back to static course catalog:", e);
    return staticCourses;
  }
};

const fetchCourseSummaries = async (): Promise<CourseSummary[]> => {
  try {
    const courses = (await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: { ...COURSE_SUMMARY_INCLUDE }
    })) as unknown as CourseSummaryRow[];
    const stats = await getCoursesStats(courses.map((c) => c.id));
    return courses.map((course) => mapCourseSummary(course, stats.get(course.id)));
  } catch (e) {
    console.warn("getCourseSummaries: DB unreachable, falling back to static course catalog:", e);
    return staticCourses.map((c): CourseSummary => ({
      id: c.id,
      title: c.title,
      category: c.category,
      level: c.level,
      duration: c.duration,
      durationMinutes: c.durationMinutes,
      totalLessons: c.totalLessons,
      rating: c.rating,
      reviewsCount: c.reviewsCount,
      students: c.students,
      price: c.price,
      priceOld: c.priceOld,
      isFree: c.isFree,
      thumbnail: c.thumbnail,
      instructorName: c.instructorName,
    }));
  }
};

/**
 * Cached public course list for list surfaces (home, /courses, related).
 * Tagged so course mutations can invalidate it on demand; also refreshes
 * every 60s as a safety net.
 */
export const getCourseSummaries = unstable_cache(
  fetchCourseSummaries,
  ["course-summaries"],
  { tags: [COURSE_LIST_TAG], revalidate: 60 }
);

/** Drop stale list data immediately after a course mutation. */
export const invalidateCourseListCache = () => {
  try {
    revalidateTag(COURSE_LIST_TAG, { expire: 0 });
  } catch (e) {
    console.warn("invalidateCourseListCache: skipping (no request scope):", e);
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