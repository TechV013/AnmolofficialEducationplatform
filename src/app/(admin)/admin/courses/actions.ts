"use server";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import { revalidatePath } from "next/cache";
import type { CourseStatus } from "@prisma/client";

export async function getAdminCourseData(courseId: string) {
  await authorizeRole("ADMIN");
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: true, instructors: { include: { user: true } } }
  });
}

export async function createCourse(data: {
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  thumbnail: string;
  slug: string;
}) {
  await authorizeRole("ADMIN");

  const title = data.title.trim();
  const slug = data.slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (!title) throw new Error("Title is required");
  if (!slug) throw new Error("Slug is required");

  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) throw new Error("A course with this slug already exists");

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description: data.description.trim(),
      category: data.category.trim() || "General",
      level: data.level.trim() || "Beginner",
      price: Number(data.price) || 0,
      thumbnail: data.thumbnail.trim(),
      status: "DRAFT"
    }
  });

  revalidatePath("/admin/courses");
  return course;
}

export async function updateCourseStatus(courseId: string, status: CourseStatus) {
  await authorizeRole("ADMIN");
  await prisma.course.update({
    where: { id: courseId },
    data: { status }
  });
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function deleteCourse(courseId: string) {
  await authorizeRole("ADMIN");
  await prisma.course.delete({ where: { id: courseId } });
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function assignInstructor(courseId: string, userId: string) {
  await authorizeRole("ADMIN");

  const instructor = await prisma.user.findUnique({ where: { id: userId } });
  if (!instructor || instructor.role !== "INSTRUCTOR") {
    throw new Error("Selected user is not an instructor");
  }

  await prisma.courseInstructor.upsert({
    where: { courseId_userId: { courseId, userId } },
    update: {},
    create: { courseId, userId }
  });
  revalidatePath("/admin/courses");
}

export async function unassignInstructor(courseId: string, userId: string) {
  await authorizeRole("ADMIN");
  await prisma.courseInstructor.delete({
    where: { courseId_userId: { courseId, userId } }
  });
  revalidatePath("/admin/courses");
}