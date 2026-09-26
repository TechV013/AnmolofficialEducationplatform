"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCourse } from "@/app/(admin)/admin/courses/actions";
import { Save, Loader2 } from "lucide-react";
import VideoUrlField from "@/components/courses/VideoUrlField";

interface CourseData {
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  priceOld: number | null;
  thumbnail: string;
  slug: string;
  promoVideoUrl: string | null;
}

export default function CourseEditForm({ courseId, course, onClose }: {
  courseId: string;
  course?: CourseData;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CourseData | null>(course || null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    if (!formData) return;
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateCourse(courseId, formData);
      onClose();
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const updateField = (field: string, value: string | number | null) => {
    setFormData(prev => prev ? ({ ...prev, [field]: value }) : prev);
  };

  if (!formData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-slate-500">Loading course data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Title *</label>
          <input
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Slug</label>
          <input
            value={formData.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
            <input
              value={formData.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Level</label>
            <select
              value={formData.level}
              onChange={(e) => updateField("level", e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Price (INR)</label>
            <input
              type="number"
              min={0}
              value={formData.price}
              onChange={(e) => updateField("price", Number(e.target.value) || 0)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Old Price (INR)</label>
            <input
              type="number"
              min={0}
              value={formData.priceOld || ""}
              onChange={(e) => updateField("priceOld", e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Thumbnail URL</label>
          <input
            value={formData.thumbnail}
            onChange={(e) => updateField("thumbnail", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <VideoUrlField
            label="Promo Video URL (YouTube, Vimeo, or direct MP4)"
            value={formData.promoVideoUrl || ""}
            onChange={(v) => updateField("promoVideoUrl", v || null)}
            placeholder="https://..."
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}