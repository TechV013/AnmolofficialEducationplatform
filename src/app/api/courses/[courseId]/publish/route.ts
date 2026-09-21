import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/helpers';
import { togglePublish } from '@/services/courses/instructor.service';

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true, isActive: true } });
  if (!dbUser || !dbUser.isActive) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { instructors: true }
  });
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isInstructor = course.instructors.some((i: any) => i.userId === user.id) || dbUser.role === 'ADMIN';
  if (!isInstructor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const updated = await togglePublish(courseId);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to publish' }, { status: 400 });
  }
}
