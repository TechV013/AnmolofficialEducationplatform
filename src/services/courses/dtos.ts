import { Course } from "@/types/lms";
import { sumDurations, formatMinutes } from "@/lib/course-stats";
import { Course as PrismaCourse, Module as PrismaModule, Lesson as PrismaLesson, Resource as PrismaResource } from "@prisma/client";

export interface CourseStats {
  rating?: number;
  reviewsCount?: number;
  students?: number;
}

export interface CourseWithModules extends PrismaCourse {
  modules: (PrismaModule & { lessons: (PrismaLesson & { resources: PrismaResource[] })[] })[];
  instructors?: { user: { name: string | null } | null }[];
}

export const mapCourse = (course: CourseWithModules, stats: CourseStats = {}): Course => {
  const lessons = course.modules.flatMap((m) => m.lessons);
  const durationMinutes = sumDurations(lessons.map((l) => l.duration));
  const instructorName = course.instructors?.length
    ? course.instructors.find((i) => i.user?.name)?.user?.name ?? course.instructors[0]?.user?.name ?? "Anmolofficial Team"
    : "Anmolofficial Team";

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level as "Beginner" | "Intermediate" | "Advanced",
    duration: formatMinutes(durationMinutes),
    durationMinutes,
    totalLessons: lessons.length,
    rating: stats.rating ?? 0,
    reviewsCount: stats.reviewsCount ?? 0,
    students: stats.students ?? 0,
    price: Number(course.price),
    priceOld: course.priceOld != null ? Number(course.priceOld) : undefined,
    isFree: Number(course.price) === 0,
    thumbnail: course.thumbnail,
    instructorName,
    whatYouWillLearn: course.whatYouWillLearn || [],
    requirements: course.requirements || [],
    promoVideoUrl: course.promoVideoUrl || undefined,
    status: course.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    modules: course.modules.map((m): Course["modules"][number] => ({
      id: m.id,
      title: m.title,
      position: m.position,
      lessons: m.lessons.map((l): Course["modules"][number]["lessons"][number] => ({
        id: l.id,
        title: l.title,
        description: l.description,
        position: l.position,
        duration: l.duration,
        videoUrl: l.videoUrl || undefined,
        type: l.type === "VIDEO" ? "video" : "assignment",
        resources: l.resources.map((r) => ({
          id: r.id,
          title: r.title,
          type: r.type.toLowerCase() as "pdf" | "link" | "file",
          url: r.url
        })),
        assignment: undefined
      }))
    }))
  };
};