"use server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { hasCourseAccess } from "@/services/enrollmentService";

export async function saveNote(lessonId: string, content: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { module: { include: { course: true } } }
    });
    if (!lesson) throw new Error("Lesson not found");
    const enrolled = await hasCourseAccess(user.id, lesson.module.courseId);
    if (!enrolled) throw new Error("Unauthorized");

    return await prisma.note.upsert({
        where: { userId_lessonId: { userId: user.id, lessonId } },
        update: { content },
        create: { userId: user.id, lessonId, content }
    });
}

export async function submitAssignment(assignmentId: string, content: string) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { lesson: { include: { module: { include: { course: true } } } } }
    });
    if (!assignment) throw new Error("Assignment not found");
    const enrolled = await hasCourseAccess(user.id, assignment.lesson.module.courseId);
    if (!enrolled) throw new Error("Unauthorized");

    return await prisma.assignmentSubmission.create({
        data: { assignmentId, userId: user.id, fileUrl: content } // Treating content as text/url submission
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
  
  const enrolled = await hasCourseAccess(user.id, lesson.module.courseId);
  if (!enrolled) throw new Error("Unauthorized");

  return await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { watchedSeconds, completed, lastWatchedAt: new Date(), completedAt: completed ? new Date() : null },
    create: { userId: user.id, lessonId, watchedSeconds, completed }
  });
}

export async function submitQuiz(quizId: string, answers: { questionId: string, optionId: string }[]) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
        include: { lesson: { include: { module: { include: { course: true } } } }, questions: { include: { options: true } } }
    });
    if (!quiz) throw new Error("Quiz not found");
    const enrolled = await hasCourseAccess(user.id, quiz.lesson.module.courseId);
    if (!enrolled) throw new Error("Unauthorized");

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
