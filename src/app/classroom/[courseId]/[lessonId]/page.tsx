import { getCourseById } from "@/services/courses/courses.service";
import { hasCourseAccess } from "@/services/enrollmentService";
import { getLessonProgress } from "@/services/progressService";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";
import ClassroomClient from "./ClassroomClient";

export default async function ClassroomPage({ params }: { params: { courseId: string; lessonId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [course, enrolled] = await Promise.all([
    getCourseById(params.courseId),
    hasCourseAccess(user.id, params.courseId)
  ]);

  if (!course || !enrolled) notFound();

  // Create ordered sequence
  const orderedLessons = course.modules
    .sort((a, b) => a.position - b.position)
    .flatMap(m => m.lessons.sort((a, b) => a.position - b.position));

  const currentLessonIndex = orderedLessons.findIndex(l => l.id === params.lessonId);
  if (currentLessonIndex === -1) notFound();

  const lesson = orderedLessons[currentLessonIndex];
  const progress = await getLessonProgress(user.id, params.lessonId);
  
  const initialProgress = progress ? { position: progress.watchedSeconds, completed: progress.completed } : null;

  return <ClassroomClient 
    course={course}
    lesson={lesson} 
    initialProgress={initialProgress} 
    courseId={params.courseId}
    prevLessonId={orderedLessons[currentLessonIndex - 1]?.id || null}
    nextLessonId={orderedLessons[currentLessonIndex + 1]?.id || null}
  />;
}
