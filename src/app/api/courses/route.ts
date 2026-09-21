import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/helpers';
import { getInstructorCourses, createCourse } from '@/services/courses/instructor.service';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } });
  if (!dbUser || !dbUser.isActive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (dbUser.role === 'ADMIN') {
    const courses = await prisma.course.findMany({
      include: { modules: { include: { lessons: true } }, instructors: { include: { user: { select: { name: true } } } } }
    });
    return NextResponse.json(courses);
  }

  if (dbUser.role === 'INSTRUCTOR') {
    const courses = await getInstructorCourses(user.id);
    return NextResponse.json(courses);
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } });
  if (!dbUser || !dbUser.isActive || (dbUser.role !== 'ADMIN' && dbUser.role !== 'INSTRUCTOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const course = await createCourse(body, user.id);
  return NextResponse.json(course, { status: 201 });
}
