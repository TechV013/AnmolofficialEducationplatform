import type { Metadata } from "next";
import { getCourseById } from "@/services/courses/courses.service";
import { hasCourseAccess } from "@/services/enrollmentService";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";
import ClassroomClient from "./ClassroomClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ClassroomPage({ params }: { params: { courseId: string; lessonId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const course = await getCourseById(params.courseId);
  if (!course) notFound();

  const enrolled = await hasCourseAccess(user.id, params.courseId);
  if (!enrolled) notFound();

  // If course is not published, only admins and instructors of the course can access
  if (course.status !== "PUBLISHED") {
    if (user.role !== "ADMIN") {
      // Check if the user is an instructor of this course
      const assignment = await prisma.courseInstructor.findUnique({
        where: { courseId_userId: { courseId: course.id, userId: user.id } }
      });
      if (!assignment) notFound();
    }
  }

  // Get all lessons in the course, ordered by module position and lesson position
  const orderedLessons = course.modules
    .sort((a, b) => a.position - b.position)
    .flatMap(m => m.lessons.sort((a, b) => a.position - b.position));

  const lessonIds = orderedLessons.map(l => l.id);

  // Fetch progress for all lessons in the course for the current user
  const allProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: lessonIds }
    }
  });

  // Create a map of lessonId to progress
  const progressMap: Record<string, { completed: boolean; watchedSeconds: number }> = {};
  allProgress.forEach(p => {
    progressMap[p.lessonId] = { completed: p.completed, watchedSeconds: p.watchedSeconds };
  });

  const currentLessonId = params.lessonId;
  const currentLessonIndex = orderedLessons.findIndex(l => l.id === currentLessonId);
  if (currentLessonIndex === -1) notFound();

  const lesson = orderedLessons[currentLessonIndex];
  const currentLessonProgress = progressMap[currentLessonId] || { completed: false, watchedSeconds: 0 };
  const initialProgress = {
    position: currentLessonProgress.watchedSeconds,
    completed: currentLessonProgress.completed
  };

  // Authoritative lesson detail (assignment, resources, quiz) for the current lesson
  const lessonDetail = await prisma.lesson.findUnique({
    where: { id: currentLessonId },
    include: {
      resources: true,
      assignment: true,
      quiz: { include: { questions: { include: { options: true } } } }
    }
  });

  const quiz = lessonDetail?.quiz
    ? {
        id: lessonDetail.quiz.id,
        questions: lessonDetail.quiz.questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options.map(o => ({ id: o.id, text: o.text }))
        }))
      }
    : null;

  const previousAttempts = quiz
    ? await prisma.quizAttempt.findMany({
        where: { userId: user.id, quizId: quiz.id },
        orderBy: { attemptedAt: "desc" }
      })
    : [];

  const assignmentDetail = lessonDetail?.assignment ?? null;

  const assignment = assignmentDetail
    ? {
        id: assignmentDetail.id,
        instructions: assignmentDetail.instructions,
        submission: await prisma.assignmentSubmission.findFirst({
          where: { assignmentId: assignmentDetail.id, userId: user.id },
          orderBy: { submittedAt: "desc" },
          select: { id: true, fileUrl: true, status: true, score: true, feedback: true }
        })
      }
    : null;

  const lessonResources = lessonDetail?.resources ?? [];

  return <ClassroomClient 
    course={course}
    lesson={lesson}
    initialProgress={initialProgress}
    courseId={params.courseId}
    progressMap={progressMap}
    prevLessonId={orderedLessons[currentLessonIndex - 1]?.id || null}
    nextLessonId={orderedLessons[currentLessonIndex + 1]?.id || null}
    quiz={quiz}
    previousAttempts={previousAttempts}
    assignment={assignment}
    lessonResources={lessonResources}
  />;
}