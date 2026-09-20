import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { togglePublish } from "@/services/courses/instructor.service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { instructors: true }
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isInstructor = course.instructors.some((i: any) => i.userId === user.id) || user.role === "ADMIN";
  if (!isInstructor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updated = await togglePublish(courseId);
  return NextResponse.json(updated);
}
