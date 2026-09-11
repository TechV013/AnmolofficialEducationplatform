import { prisma } from "@/lib/prisma";
import type { Course } from "@/types/lms";
import { mapCourse } from "./dtos";

export const getPublishedCourses = async (): Promise<Course[]> => {
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
};

export const getCourseById = async (courseId: string): Promise<Course | null> => {
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
};
