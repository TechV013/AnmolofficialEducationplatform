import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getInstructorCourses, createCourse } from "@/services/courses/instructor.service";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "ADMIN") {
    const courses = await prisma.course.findMany({
      include: { modules: { include: { lessons: true } }, instructors: { include: { user: { select: { name: true } } } } }
    });
    return NextResponse.json(courses);
  }

  const courses = await getInstructorCourses(user.id);
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const course = await createCourse(body, user.id);
  return NextResponse.json(course, { status: 201 });
}
