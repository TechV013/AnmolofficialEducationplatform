export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireCourseEditor } from "@/lib/auth/authorizer";
import { deleteLesson, deleteQuiz, deleteAssignment, createQuiz } from "./actions";
import CourseForm from "@/components/instructor/CourseForm";
import CourseStatusButtons from "@/components/instructor/CourseStatusButtons";
import ModuleForm from "@/components/instructor/ModuleForm";
import ModuleHeader from "@/components/instructor/ModuleHeader";
import LessonCreateForm from "@/components/instructor/LessonCreateForm";
import LessonEditForm from "@/components/instructor/LessonEditForm";
import ResourceManager from "@/components/instructor/ResourceManager";
import { QuizEditor } from "@/components/instructor/QuizEditor";
import AssignmentForm from "@/components/instructor/AssignmentForm";
import SubmissionGrader from "@/components/instructor/SubmissionGrader";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { BookOpen, ClipboardList, FileQuestion, Eye, Trash2, GraduationCap } from "lucide-react";

export const metadata: Metadata = { title: "Course Management — Instructor", robots: { index: false, follow: false } };

const STATUS_VARIANT: Record<string, "warning" | "success" | "secondary"> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "secondary",
};

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export default async function CourseManagementPage({ params }: { params: { courseId: string } }) {
  await requireCourseEditor(params.courseId);

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: {
              resources: true,
              quiz: { include: { questions: { include: { options: true } } } },
              assignment: true
            }
          }
        }
      }
    }
  });
  if (!course) return <div className="p-12 text-xl">Course not found</div>;

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignment: { lesson: { module: { courseId: course.id } } } },
    orderBy: { submittedAt: "desc" },
    include: {
      assignment: { include: { lesson: { select: { id: true, title: true } } } },
      user: { select: { name: true, email: true } }
    }
  });

  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter((s) => s.status !== "REVIEWED").length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
              <Badge variant={STATUS_VARIANT[course.status] || "secondary"}>{course.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {course.modules.length} modules · {course.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons · /{course.slug}
            </p>
          </div>
          <CourseStatusButtons courseId={course.id} status={course.status} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Link href={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            <Eye className="h-4 w-4" /> Preview public page
          </Link>
        </div>
      </header>

      <section>
        <CourseForm
          course={{
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            thumbnail: course.thumbnail,
            slug: course.slug
          }}
        />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Course Content</h2>
        </div>

        <div className="mb-6">
          <ModuleForm courseId={course.id} />
        </div>

        <div className="space-y-6">
          {course.modules.map((module, index) => (
            <div key={module.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <ModuleHeader moduleId={module.id} title={module.title} courseId={course.id} index={index} />

              <div className="mt-5 space-y-4 border-t border-border/50 pt-5">
                <div>
                  <LessonCreateForm moduleId={module.id} courseId={course.id} />
                </div>

                {module.lessons.length === 0 && (
                  <p className="text-sm text-slate-400">No lessons yet — add the first one above.</p>
                )}

                {module.lessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-xl border border-border/60 bg-slate-50/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 font-semibold text-slate-800">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {lesson.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">{lesson.duration || "—"}</span>
                        <form action={deleteLesson.bind(null, lesson.id, course.id)}>
                          <button className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </form>
                      </div>
                    </div>

                    <LessonEditForm
                      lessonId={lesson.id}
                      courseId={course.id}
                      initialTitle={lesson.title}
                      initialDescription={lesson.description || ""}
                      initialVideoUrl={lesson.videoUrl}
                    />

                    {/* Resources */}
                    <div className="mt-3 rounded-xl border border-border/60 bg-white p-3">
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Resources</h4>
                      <ResourceManager lessonId={lesson.id} courseId={course.id} resources={lesson.resources} />
                    </div>

                    {/* Quiz */}
                    <div className="mt-3 rounded-xl border border-border/60 bg-white p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                          <FileQuestion className="h-4 w-4" /> Quiz
                        </h4>
                        {lesson.quiz && (
                          <form action={deleteQuiz.bind(null, lesson.quiz.id, course.id)}>
                            <button className="rounded-full border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                              Delete Quiz
                            </button>
                          </form>
                        )}
                      </div>
                      {lesson.quiz ? (
                        <QuizEditor quiz={lesson.quiz} courseId={course.id} />
                      ) : (
                        <form action={createQuiz.bind(null, lesson.id, course.id)}>
                          <button className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary/30 px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5">
                            <FileQuestion className="h-3.5 w-3.5" /> Create Quiz
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Assignment */}
                    <div className="mt-3 rounded-xl border border-border/60 bg-white p-3">
                      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <ClipboardList className="h-4 w-4" /> Assignment
                      </h4>
                      {lesson.assignment ? (
                        <div className="space-y-2 text-sm">
                          <p className="text-slate-700">{lesson.assignment.instructions}</p>
                          {lesson.assignment.dueDate && (
                            <p className="text-xs text-slate-500">Due: {new Date(lesson.assignment.dueDate).toLocaleDateString()}</p>
                          )}
                          <form action={deleteAssignment.bind(null, lesson.assignment.id, course.id)}>
                            <button className="rounded-full border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                              Delete Assignment
                            </button>
                          </form>
                        </div>
                      ) : (
                        <AssignmentForm lessonId={lesson.id} courseId={course.id} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <GraduationCap className="h-5 w-5 text-primary" />
            Assignment Submissions
          </h2>
          <div className="flex gap-2">
            <Badge variant="secondary">{totalSubmissions} submitted</Badge>
            {pendingSubmissions > 0 && <Badge variant="warning">{pendingSubmissions} pending review</Badge>}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {submissions.length === 0 ? (
            <p className="p-10 text-center text-sm text-slate-400">
              Student submissions will appear here for grading.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {submissions.map((s) => (
                <li key={s.id} className="p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {initials(s.user.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{s.user.name || s.user.email}</p>
                      <p className="truncate text-xs text-slate-500">
                        {s.assignment.lesson.title} · {new Date(s.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    {s.status === "REVIEWED" ? (
                      <Badge variant="success">Graded {s.score !== null ? `· ${s.score}` : ""}</Badge>
                    ) : (
                      <Badge variant="warning">Pending review</Badge>
                    )}
                  </div>
                  <p className="mt-3 rounded-lg border border-border/60 bg-slate-50 p-3 text-sm text-slate-600">
                    {s.fileUrl || "No content"}
                  </p>
                  <div className="mt-3">
                    <SubmissionGrader
                      submissionId={s.id}
                      courseId={course.id}
                      initialScore={s.score}
                      initialFeedback={s.feedback}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}