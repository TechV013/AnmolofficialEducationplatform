import { prisma } from "@/lib/prisma";
import { CourseStatus, LessonType } from "@prisma/client";

export async function getInstructorCourses(userId: string) {
  const courses = await prisma.course.findMany({
    where: {
      instructors: { some: { userId } },
      status: { not: CourseStatus.ARCHIVED }
    },
    include: {
      modules: {
        include: {
          lessons: { include: { resources: true, assignment: true } }
        }
      },
      instructors: { include: { user: { select: { name: true } } } },
      enrollments: { select: { userId: true, status: true } }
    }
  });
  return courses.map((c: any) => ({
    ...c,
    studentCount: c.enrollments.filter((e: any) => e.status === "ACTIVE").length,
    modulesCount: c.modules.length,
    lessonsCount: c.modules.reduce((acc: number, m: { lessons: any[] }) => acc + m.lessons.length, 0)
  }));
}

export async function getCourseForInstructor(courseId: string, userId: string) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      instructors: { some: { userId } }
    },
    include: {
      modules: {
        include: {
          lessons: { include: { resources: true, assignment: true } }
        }
      },
      instructors: { include: { user: { select: { name: true } } } },
      enrollments: { select: { userId: true, status: true } }
    }
  });
  if (!course) return null;
  return {
    ...(course as any),
    studentCount: (course as any).enrollments.filter((e: any) => e.status === "ACTIVE").length,
    modulesCount: (course as any).modules.length,
    lessonsCount: (course as any).modules.reduce((acc: number, m: { lessons: any[] }) => acc + m.lessons.length, 0)
  };
}

export async function createCourse(data: { title: string; description: string; category: string; level: string; price: number; thumbnail: string; whatYouWillLearn: string[]; requirements: string[]; }, userId: string) {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
  const course = await prisma.course.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      category: data.category,
      level: data.level,
      price: data.price,
      thumbnail: data.thumbnail,
      whatYouWillLearn: data.whatYouWillLearn,
      requirements: data.requirements,
      status: CourseStatus.DRAFT,
      instructors: { create: { userId } }
    },
    include: { modules: true, instructors: { include: { user: { select: { name: true } } } } }
  });
  return course;
}

export async function updateCourse(courseId: string, userId: string, data: Partial<{ title: string; description: string; category: string; level: string; price: number; thumbnail: string; whatYouWillLearn: string[]; requirements: string[]; }>) {
  const course = await prisma.course.update({ where: { id: courseId }, data });
  return course;
}

export async function deleteCourse(courseId: string) {
  await prisma.course.delete({ where: { id: courseId } });
  return { deleted: true };
}

export async function togglePublish(courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return null;
  const newStatus = course.status === CourseStatus.PUBLISHED ? CourseStatus.DRAFT : CourseStatus.PUBLISHED;
  const updated = await prisma.course.update({ where: { id: courseId }, data: { status: newStatus } });
  return updated;
}

export async function addModule(courseId: string, title: string, position: number) {
  return prisma.module.create({ data: { courseId, title, position } });
}

export async function addLesson(moduleId: string, data: { title: string; description: string; duration: string; type: string; videoUrl?: string; position: number }) {
  return prisma.lesson.create({
    data: {
      moduleId,
      title: data.title,
      description: data.description,
      duration: data.duration,
      type: data.type === "TEXT" ? LessonType.TEXT : LessonType.VIDEO,
      videoUrl: data.videoUrl,
      position: data.position
    }
  });
}

export async function updateLesson(lessonId: string, data: Partial<{ title: string; description: string; duration: string; videoUrl: string; position: number }>) {
  return prisma.lesson.update({ where: { id: lessonId }, data });
}

export async function deleteLesson(lessonId: string) {
  await prisma.lesson.delete({ where: { id: lessonId } });
  return { deleted: true };
}

export async function deleteModule(moduleId: string) {
  await prisma.module.delete({ where: { id: moduleId } });
  return { deleted: true };
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  const updates = moduleIds.map((id: string, i: number) => prisma.module.update({ where: { id }, data: { position: i } }));
  await Promise.all(updates);
  return { reordered: true };
}

export async function getCourseEngagement(courseId: string) {
  const totalEnrollments = await prisma.enrollment.count({ where: { courseId, status: "ACTIVE" } });
  const totalReviews = await prisma.review.count({ where: { courseId } });
  const avgRating = await prisma.review.groupBy({ by: ["courseId"], where: { courseId }, _avg: { rating: true }, _count: { _all: true } });
  const completedStudents = await prisma.lessonProgress.findMany({
    where: { lesson: { module: { courseId } }, completed: true },
    select: { userId: true }
  });
  const uniqueCompleted = new Set(completedStudents.map((s: { userId: string }) => s.userId)).size;

  return {
    totalEnrollments,
    totalReviews,
    avgRating: avgRating[0]?._avg.rating ?? 0,
    reviewsCount: avgRating[0]?._count._all ?? 0,
    completedStudents: uniqueCompleted
  };
}
