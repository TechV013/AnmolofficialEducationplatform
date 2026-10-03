import { requireInstructor } from "@/lib/auth/helpers";
import { getCourseForInstructor, deleteCourse } from "@/services/courses/instructor.service";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Trash2, ClipboardList } from "lucide-react";
import CourseForm from "@/components/instructor/CourseForm";
import IntroVideoForm from "@/components/instructor/IntroVideoForm";
import CourseCurriculumBuilder, { type StudioModule } from "@/components/instructor/CourseCurriculumBuilder";
import PublishButton from "@/components/instructor/PublishButton";
import SafeThumb from "@/components/ui/SafeThumb";

type RawModule = {
  id: string;
  title: string;
  position: number;
  lessons: RawLesson[];
};

type RawLesson = {
  id: string;
  title: string;
  description: string;
  duration: string;
  position: number;
  videoUrl: string | null;
  quiz: {
    id: string;
    questions: { id: string; text: string; options: { id: string; text: string; isCorrect: boolean }[] }[] | null;
  } | null;
  assignment: { id: string; instructions: string; dueDate: Date | null } | null;
  resources: { id: string; title: string; type: "PDF" | "DOCUMENT" | "PROJECT_FILE" | "EXTERNAL_LINK"; url: string }[];
};

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireInstructor();
  const course = await getCourseForInstructor(courseId, user.id);
  if (!course) notFound();

  const studioModules: StudioModule[] = course.modules.map((m: RawModule) => ({
    id: m.id,
    title: m.title,
    position: m.position,
    lessons: m.lessons.map((l: RawLesson) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      duration: l.duration,
      position: l.position,
      videoUrl: l.videoUrl ?? null,
      quizId: l.quiz?.id ?? null,
      quiz: l.quiz
        ? {
            id: l.quiz.id,
            questions: (l.quiz.questions ?? []).map((q) => ({
              id: q.id,
              text: q.text,
              options: (q.options ?? []).map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect }))
            }))
          }
        : null,
      assignmentId: l.assignment?.id ?? null,
      assignment: l.assignment
        ? { id: l.assignment.id, instructions: l.assignment.instructions, dueDate: l.assignment.dueDate }
        : null,
      resources: (
        (l.resources ?? []) as {
          id: string;
          title: string;
          type: "PDF" | "DOCUMENT" | "PROJECT_FILE" | "EXTERNAL_LINK";
          url: string;
        }[]
      ).map((r) => ({ id: r.id, title: r.title, type: r.type, url: r.url }))
    }))
  }));

  return (
    <div className="space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/instructor" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-text">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/instructor/courses/${course.id}/submissions`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-bold text-text hover:bg-slate-50">
            <ClipboardList className="h-4 w-4" />
            <span>Submissions</span>
          </Link>
          <Link href={`/courses/${course.id}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-bold text-text hover:bg-slate-50">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </Link>
          <PublishButton courseId={course.id} initialStatus={course.status} />
          <form action={async () => {
            "use server";
            try {
              await deleteCourse(course.id);
            } catch (err) {
              console.error("Delete error:", err);
            }
            redirect("/instructor");
          }}>
            <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors">
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </form>
        </div>
      </div>

      {/* Course Info Banner */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-32 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            <SafeThumb
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
              fallback={<div className="h-full w-full bg-gradient-to-br from-[#172554] via-[#1E40AF] to-primary" />}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {course.status}
              </span>
              <span className="text-xs font-semibold text-muted">{course.category} • {course.level}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-text">{course.title}</h1>
            <p className="text-xs text-muted mt-1">{course.studentCount} enrolled students • {course.modules.length} modules</p>
          </div>
        </div>
      </div>

      {/* Edit Course Settings Form */}
      <div className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4">Course Information</h2>
        <CourseForm course={{
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          thumbnail: course.thumbnail,
          slug: course.slug,
          price: course.price.toString()
        }} />
      </div>

      {/* Course Intro Video (course-level preview, NOT part of curriculum) */}
      <section className="rounded-2xl border border-border bg-background p-4 sm:p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-text">Course Intro Video</h2>
          <p className="text-xs text-muted mt-1">
            Shown as a preview on the course page.
          </p>
        </div>
        <IntroVideoForm courseId={course.id} initialVideoUrl={course.promoVideoUrl} />
      </section>

      {/* Curriculum Builder: Modules & Lessons (student learning sessions) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text">Curriculum & Sessions</h2>
          <p className="text-xs text-muted mt-1">Learning sessions students access after enrollment.</p>
        </div>

        <CourseCurriculumBuilder courseId={course.id} modules={studioModules} />
      </div>
    </div>
  );
}
