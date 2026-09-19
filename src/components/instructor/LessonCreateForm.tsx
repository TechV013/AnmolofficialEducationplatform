"use client";
import { useState } from "react";
import { createLesson } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { useRouter } from "next/navigation";

interface Props {
  moduleId: string;
  courseId: string;
}

export default function LessonCreateForm({ moduleId, courseId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "");
    const description = String(form.get("description") || "");
    const duration = String(form.get("duration") || "");
    const videoUrl = String(form.get("videoUrl") || "");
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createLesson(moduleId, title, description, duration, videoUrl || null, courseId);
      e.currentTarget.reset();
      setOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border-2 border-primary/30 px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        + Add Lesson
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-xl border border-border bg-white p-4 shadow-sm">
      <h4 className="text-sm font-bold text-slate-800">New Lesson</h4>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <input name="title" placeholder="Lesson title" required className="w-full rounded-lg border px-3 py-2 text-sm" />
      <textarea name="description" placeholder="Lesson description" rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input name="duration" placeholder="Duration (e.g. 12:30)" className="rounded-lg border px-3 py-2 text-sm" />
        <input name="videoUrl" placeholder="Video URL (optional)" className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div className="flex gap-2">
        <button disabled={loading} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          {loading ? "Saving..." : "Create Lesson"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600">
          Cancel
        </button>
      </div>
    </form>
  );
}