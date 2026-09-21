import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/helpers';
import { getCourseForInstructor, updateCourse, deleteCourse } from '@/services/courses/instructor.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } });
  if (!dbUser || !dbUser.isActive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (dbUser.role === 'ADMIN') {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { modules: { include: { lessons: { include: { resources: true, assignment: true } } } }, instructors: { include: { user: { select: { name: true } } } } }
    });
    return NextResponse.json(course);
  }

  const course = await getCourseForInstructor(courseId, user.id);
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } });
  if (!dbUser || !dbUser.isActive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (dbUser.role === 'ADMIN') {
    const body = await req.json();
    const course = await prisma.course.update({ where: { id: courseId }, data: body });
    return NextResponse.json(course);
  }

  const course = await getCourseForInstructor(courseId, user.id);
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await updateCourse(courseId, user.id, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } });
  if (!dbUser || !dbUser.isActive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const course = dbUser.role === 'ADMIN'
    ? await prisma.course.findUnique({ where: { id: courseId } })
    : await getCourseForInstructor(courseId, user.id);

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await deleteCourse(courseId);
  return NextResponse.json({ deleted: true });
}
