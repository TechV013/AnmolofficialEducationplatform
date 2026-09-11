import { Course, Module, Lesson, Resource } from "@/types/lms";
import { Course as PrismaCourse, Module as PrismaModule, Lesson as PrismaLesson, Resource as PrismaResource } from "@prisma/client";

export const mapCourse = (course: PrismaCourse & { modules: (PrismaModule & { lessons: (PrismaLesson & { resources: PrismaResource[] })[] })[] }): Course => ({
  id: course.id,
  title: course.title,
  description: course.description,
  category: course.category,
  level: course.level as "Beginner" | "Intermediate" | "Advanced",
  duration: "N/A", 
  totalLessons: course.modules.reduce((acc, m) => acc + m.lessons.length, 0),
  rating: 0,
  students: 0,
  price: Number(course.price),
  isFree: Number(course.price) === 0,
  thumbnail: course.thumbnail,
  modules: course.modules.map((m): Module => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map((l): Lesson => ({
      id: l.id,
      title: l.title,
      description: l.description,
      videoUrl: l.videoUrl || undefined,
      duration: l.duration,
      type: l.type === "VIDEO" ? "video" : "assignment",
      resources: l.resources.map((r): Resource => ({
        id: r.id,
        title: r.title,
        type: r.type.toLowerCase() as "pdf" | "link" | "file",
        url: r.url
      })),
      assignment: undefined // Assignment logic to be added
    }))
  }))
});
