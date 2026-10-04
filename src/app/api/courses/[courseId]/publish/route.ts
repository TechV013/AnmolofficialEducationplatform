import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/helpers';
import { requireCourseEditor } from '@/lib/auth/authorizer';
import {
  CourseNotFoundError,
  CoursePublishValidationError,
  publishCourse,
  togglePublish,
  unpublishCourse
} from '@/services/courses/instructor.service';

type PublishIntent = 'publish' | 'unpublish';

async function readIntent(req: NextRequest): Promise<PublishIntent | null> {
  try {
    const body: unknown = await req.json();
    if (body && typeof body === 'object' && 'action' in body) {
      const action = (body as { action?: unknown }).action;
      if (action === 'publish' || action === 'unpublish') return action;
      throw new Error('Invalid action: expected "publish" or "unpublish"');
    }
    return null;
  } catch (err) {
    if (err instanceof SyntaxError) return null;
    throw err;
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;

  const user = await getCurrentUser();
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let intent: PublishIntent | null;
  try {
    intent = await readIntent(req);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await requireCourseEditor(courseId);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Same canonical business logic as Course Studio (server actions).
    const updated =
      intent === 'publish'
        ? await publishCourse(courseId)
        : intent === 'unpublish'
          ? await unpublishCourse(courseId)
          : await togglePublish(courseId);

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof CourseNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof CoursePublishValidationError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    const message = err instanceof Error ? err.message : 'Failed to publish';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}