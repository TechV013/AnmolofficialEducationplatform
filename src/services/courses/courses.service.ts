import { prisma } from "@/lib/prisma";
import type { Course } from "@/types/lms";
import { mapCourse } from "./dtos";
import { courses as staticCourses } from "@/data/courses";

export const getPublishedCourses = async (): Promise<Course[]> => {
  try {
    const courses = await prisma.course.findMany({
      where: { status: "PUBLISHED" },
      include: {
        modules: {
          include: {
            lessons: { include: { resources: true } }
          }
        }
      }
    });                
    return courses.map(mapCourse);
  } catch (e) {
    console.warn("getPublishedCourses: DB unreachable, falling back to static course catalog:", e);
    return staticCourses;
  }
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: { include: { resources: true, assignment: true } }
          }
        }
      }
    });                
    return course ? mapCourse(course) : null;
  } catch (e) {
    console.warn(`getCourseById: DB unreachable for courseId ${courseId}, checking static catalog:`, e);
    const found = staticCourses.find((c) => c.id === courseId);
    return found || null;
  }
};
