"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/app/(admin)/admin/courses/actions";

export default function CourseCreateForm() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setBusy(true);
    try {
      await createCourse({
        title: String(formData.get("title") || ""),
        description: String(formData.get("description") || ""),
        category: String(formData.get("category") || ""),
        level: String(formData.get("level") || ""),
        price: Number(formData.get("price") || 0),
        thumbnail: String(formData.get("thumbnail") || ""),
        slug: String(formData.get("slug") || "")
      });
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form action={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Create New Course</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
          <input name="title" required className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Graphic Design Masterclass" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Description *</label>
          <textarea name="description" required rows={3} className="w-full border rounded px-3 py-2 text-sm" placeholder="Short course description" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Slug</label>
          <input name="slug" className="w-full border rounded px-3 py-2 text-sm" placeholder="auto-generated if empty" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
          <input name="category" className="w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Design" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Level</label>
          <select name="level" className="w-full border rounded px-3 py-2 text-sm">
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Price (INR)</label>
          <input name="price" type="number" min={0} defaultValue={0} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Thumbnail URL</label>
          <input name="thumbnail" className="w-full border rounded px-3 py-2 text-sm" placeholder="https://..." />
        </div>
      </div>
      <button disabled={busy} className="bg-primary text-white px-4 py-2 rounded text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
        {busy ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
}