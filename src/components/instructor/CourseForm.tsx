"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse, updateCourse } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

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
  const [thumbnail, setThumbnail] = useState(course?.thumbnail || "");
  const [uploadingImage, setUploadingImage] = useState(false);
  const isEdit = Boolean(course);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");

      setThumbnail(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

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
          thumbnail: thumbnail || String(form.get("thumbnail") || ""),
          slug: String(form.get("slug") || "")
        });
        router.refresh();
      } else {
        form.set("thumbnail", thumbnail);
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
        <div className="md:col-span-2 space-y-2">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Thumbnail Image (URL or Local Upload)</label>
          <div className="flex items-center gap-3">
            <input name="thumbnail" value={thumbnail} onChange={e => setThumbnail(e.target.value)} className="flex-1 rounded-lg border px-3 py-2 text-sm" placeholder="https://... or upload file" />
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-soft-blue text-primary font-semibold text-xs hover:bg-soft-blue/80 transition-colors">
              {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{uploadingImage ? "Uploading..." : "Upload from Device"}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
            </label>
          </div>
          {thumbnail && (
            <div className="mt-2 h-32 w-48 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <img src={thumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <button disabled={busy} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity hover:bg-primary-hover disabled:opacity-60">
        {busy ? "Saving..." : isEdit ? "Save Changes" : "Create Course"}
      </button>
    </form>
  );
}
