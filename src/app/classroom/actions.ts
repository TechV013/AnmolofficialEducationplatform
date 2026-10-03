"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { assertCourseContentAccess } from "@/services/courseAccessService";
import { getCourseCompletionStatus } from "@/services/progressService";
import { issueCertificate } from "@/services/certificates/certificate.service";

export async function saveNote(lessonId: string, content: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: { include: { course: true } } }
    });
    if (!lesson) throw new Error("Lesson not found");
    await assertCourseContentAccess(user.id, lesson.module.courseId);

    return await prisma.note.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        update: { content },
        create: { userId: user.id, lessonId, content }
    });
}

/**
 * `AssignmentSubmission.fileUrl` is the only payload column, so a typed response
 * is persisted as a data URI and an uploaded file as its stored URL. A model
 * migration would let us store both in dedicated columns.
 */
function encodeSubmissionPayload(content: string, fileUrl: string | null): string | null {
    if (fileUrl) return fileUrl;
    const trimmed = content.trim();
    if (!trimmed) return null;
    return `data:text/plain;charset=utf-8,${encodeURIComponent(trimmed)}`;
}

export async function submitAssignment(assignmentId: string, content: string, fileUrl: string | null = null) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { lesson: { include: { module: { include: { course: true } } } } }
    });
    if (!assignment) throw new Error("Assignment not found");
    await assertCourseContentAccess(user.id, assignment.lesson.module.courseId);

    const fileUrlValue = encodeSubmissionPayload(content, fileUrl);
    if (!fileUrlValue) throw new Error("Nothing to submit");

    // No composite unique key exists, so resolve the existing row by query.
    const existing = await prisma.assignmentSubmission.findFirst({
        where: { assignmentId, userId: user.id }
    });

    // A re-submission after grading keeps the grade intact so instructor work is
    // never silently wiped.
    const status = existing?.status === "REVIEWED" ? "REVIEWED" : "SUBMITTED";

    if (existing) {
        return await prisma.assignmentSubmission.update({
            where: { id: existing.id },
            data: { fileUrl: fileUrlValue, status, submittedAt: new Date() }
        });
    }

    return await prisma.assignmentSubmission.create({
        data: { assignmentId, userId: user.id, fileUrl: fileUrlValue, status }
    });
}


export async function updateProgress(lessonId: string, watchedSeconds: number, completed: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  // Verify access implicitly by verifying lesson exists within an accessible course
  const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } }
  });
  if (!lesson) throw new Error("Lesson not found");
  
  await assertCourseContentAccess(user.id, lesson.module.courseId);

  const now = new Date();
  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    // Only a `completed: true` call may touch the completion fields. Writing
    // `completedAt: null` on every ordinary playback tick un-completed lessons
    // that had already been finished, which also made the certificate check
    // below flap.
    update: {
      watchedSeconds,
      lastWatchedAt: now,
      ...(completed ? { completed: true, completedAt: now } : {}),
    },
    create: {
      userId: user.id,
      lessonId,
      watchedSeconds,
      completed,
      ...(completed ? { completedAt: now } : {}),
    }
  });

  // Auto-issue certificate as soon as a student reaches 100% completion
  if (completed) {
    const completion = await getCourseCompletionStatus(user.id, lesson.module.courseId);
    if (completion.completed) {
      try {
        await issueCertificate(user.id, lesson.module.courseId);
      } catch (e) {
        console.error("Certificate issuance failed:", e);
      }
    }
  }

  return progress;
}

export async function submitQuiz(quizId: string, answers: { questionId: string, optionId: string }[]) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { lesson: { include: { module: { include: { course: true } } } }, questions: { include: { options: true } } }
    });
    if (!quiz) throw new Error("Quiz not found");
    await assertCourseContentAccess(user.id, quiz.lesson.module.courseId);

    let score = 0;
    for (const answer of answers) {
        const question = quiz.questions.find(q => q.id === answer.questionId);
        const option = question?.options.find(o => o.id === answer.optionId);
        if (option && option.isCorrect) score++;
    }

    await prisma.quizAttempt.create({
        data: { userId: user.id, quizId, score, passed: score === quiz.questions.length }
    });

    return { score, total: quiz.questions.length };
}
