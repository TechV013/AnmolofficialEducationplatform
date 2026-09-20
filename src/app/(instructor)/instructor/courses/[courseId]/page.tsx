import { requireInstructor } from "@/lib/auth/helpers";
import { getCourseForInstructor } from "@/services/courses/instructor.service";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Globe, Eye } from "lucide-react";
import VideoUploader from "@/components/courses/VideoUploader";

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireInstructor();
  const course = await getCourseForInstructor(courseId, user.id);
  if (!course) notFound();

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/instructor" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-text">
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href={`/courses/${course.id}`} target="_blank" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-white text-sm font-bold text-text hover:bg-slate-50">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </Link>
            <form action={async () => {
              "use server";
              await fetch(`http://localhost:3000/api/courses/${course.id}/publish`, { method: "POST" });
            }}>
              <button type="submit" className={`inline-flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-white transition-all ${course.status === "PUBLISHED" ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
                <Globe className="h-4 w-4" />
                <span>{course.status === "PUBLISHED" ? "Unpublish" : "Publish Course"}</span>
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">{course.title}</h1>
          <p className="text-sm text-muted">Status: <span className="font-bold uppercase">{course.status}</span> | Students: {course.studentCount}</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-text">Modules & Lessons</h2>
          {course.modules.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-8 text-center text-muted">
              No modules yet. Use the API or add modules to build your curriculum.
            </div>
          ) : (
            course.modules.map((m: any) => (
              <div key={m.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-text mb-4">Module {m.position + 1}: {m.title}</h3>
                <div className="space-y-4">
                  {m.lessons.map((l: any) => (
                    <div key={l.id} className="rounded-xl border border-border p-4 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-bold text-text">{l.title}</p>
                        <p className="text-xs text-muted">{l.duration} • {l.type}</p>
                        {l.videoUrl && <p className="text-xs text-emerald-600 font-medium mt-1">Video uploaded: {l.videoUrl}</p>}
                      </div>
                      <div className="w-full sm:w-auto">
                        <VideoUploader lessonId={l.id} onUploaded={(url) => { window.location.reload(); }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
