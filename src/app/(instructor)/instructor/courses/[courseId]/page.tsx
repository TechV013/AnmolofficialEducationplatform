import { requireInstructor } from "@/lib/auth/helpers";
import { getCourseForInstructor, deleteCourse } from "@/services/courses/instructor.service";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Trash2, Plus, Film } from "lucide-react";
import VideoUploader from "@/components/courses/VideoUploader";
import { createModule, createLesson, deleteModule, deleteLesson } from "./actions";
import CourseForm from "@/components/instructor/CourseForm";
import PublishButton from "@/components/instructor/PublishButton";

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireInstructor();
  const course = await getCourseForInstructor(courseId, user.id);
  if (!course) notFound();

  return (
    <div className="space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link href="/instructor" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-text">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
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
            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
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
        <h2 className="text-lg font-bold text-text mb-4">Course Settings & Promo Video</h2>
        <CourseForm course={{
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          thumbnail: course.thumbnail,
          slug: course.slug,
          price: course.price.toString(),
          promoVideoUrl: course.promoVideoUrl
        }} />
      </div>

      {/* Curriculum Builder: Modules & Lessons */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-text">Curriculum (Modules & Lessons)</h2>
        </div>

        {/* Add Module Form */}
        <form action={async (formData: FormData) => {
          "use server";
          const title = String(formData.get("moduleTitle") || "");
          if (!title.trim()) return;
          await createModule(course.id, title);
        }} className="flex gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <input name="moduleTitle" required placeholder="New Module Title (e.g. 1. Introduction to Maya)" className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <button type="submit" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-all shrink-0">
            <Plus className="h-4 w-4" />
            <span>Add Module</span>
          </button>
        </form>

        {/* Modules List */}
        {course.modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-muted">
            <Film className="h-10 w-10 text-muted/40 mx-auto mb-3" />
            <p className="font-semibold text-text">No modules created yet</p>
            <p className="text-xs text-muted mt-1">Add your first module above to start building curriculum and uploading lesson videos.</p>
          </div>
        ) : (
          course.modules.map((m: any) => (
            <div key={m.id} className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
              <div className="bg-slate-50 border-b border-border px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-text">Module {m.position + 1}: {m.title}</h3>
                  <p className="text-xs text-muted">{m.lessons.length} lessons</p>
                </div>
                <form action={async () => {
                  "use server";
                  await deleteModule(m.id, course.id);
                }}>
                  <button type="submit" className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors" title="Delete Module">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="p-6 space-y-4">
                {m.lessons.length === 0 ? (
                  <p className="text-xs text-muted py-2">No lessons in this module yet. Add a lesson below.</p>
                ) : (
                  m.lessons.map((l: any) => (
                    <div key={l.id} className="rounded-xl border border-border p-4 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-soft-blue text-xs font-bold text-primary">{l.position + 1}</span>
                          <h4 className="font-bold text-text text-sm truncate">{l.title}</h4>
                        </div>
                        <p className="text-xs text-muted mt-1">{l.description || "No description"}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          {l.duration && <span className="text-muted">Duration: {l.duration}</span>}
                          {l.videoUrl ? (
                            <span className="text-emerald-600 font-medium">✓ Video attached ({l.videoUrl})</span>
                          ) : (
                            <span className="text-amber-600 font-medium">⚠️ No video uploaded</span>
                          )}
                        </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-full sm:w-64">
                          <VideoUploader lessonId={l.id} />
                        </div>
                        <form action={async () => {
                          "use server";
                          await deleteLesson(l.id, course.id);
                        }}>
                          <button type="submit" className="p-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="Delete Lesson">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))
                )}

                {/* Add Lesson Form */}
                <div className="pt-4 border-t border-border">
                  <form action={async (formData: FormData) => {
                    "use server";
                    const title = String(formData.get("lessonTitle") || "");
                    const description = String(formData.get("lessonDesc") || "");
                    const duration = String(formData.get("lessonDuration") || "10:00");
                    if (!title.trim()) return;
                    await createLesson(m.id, title, description, duration, null, course.id);
                  }} className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_120px_auto] gap-2">
                    <input name="lessonTitle" required placeholder="Lesson title *" className="rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input name="lessonDesc" placeholder="Description (optional)" className="rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input name="lessonDuration" placeholder="Duration (e.g. 15:00)" className="rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="submit" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-soft-blue text-primary font-bold text-xs hover:bg-soft-blue/80 transition-colors">
                      <Plus className="h-4 w-4" />
                      <span>Add Lesson</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
