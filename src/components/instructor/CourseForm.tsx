"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, updateCourse } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

interface CourseSettings {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail: string;
  slug: string;
  price?: string;
}

export default function CourseForm({ course }: { course?: CourseSettings }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(course);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget);
      if (course) {
        await updateCourse(course.id, {
          title: String(form.get("title") || ""),
          description: String(form.get("description") || ""),
          category: String(form.get("category") || ""),
          level: String(form.get("level") || ""),
          thumbnail: String(form.get("thumbnail") || ""),
          slug: String(form.get("slug") || "")
        });
        router.refresh();
      } else {
        const id = await createCourse(form);
        router.push(`/instructor/courses/${id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800">{isEdit ? "Course Settings" : "Create New Course"}</h3>
        {isEdit && <p className="text-xs text-slate-400">Pricing is managed in the admin panel</p>}
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Title *</label>
          <input name="title" required defaultValue={course?.title} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. Graphic Design Masterclass" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Description *</label>
          <textarea name="description" required rows={3} defaultValue={course?.description} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Short course description" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Slug</label>
          <input name="slug" defaultValue={course?.slug} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="auto-generated if empty" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Category</label>
          <input name="category" defaultValue={course?.category} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. Design" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Level</label>
          <select name="level" defaultValue={course?.level || "Beginner"} className="w-full rounded-lg border px-3 py-2 text-sm">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Price (INR)</label>
          <input name="price" type="number" min={0} defaultValue={course?.price !== undefined ? course.price : "0"} disabled={isEdit} className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-400" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Thumbnail URL</label>
          <input name="thumbnail" defaultValue={course?.thumbnail} className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://..." />
        </div>
      </div>

      <button disabled={busy} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity hover:bg-primary-hover disabled:opacity-60">
        {busy ? "Saving..." : isEdit ? "Save Changes" : "Create Course"}
      </button>
    </form>
  );
}