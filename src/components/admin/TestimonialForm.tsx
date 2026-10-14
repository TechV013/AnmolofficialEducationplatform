"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ImagePlus, Star } from "lucide-react";
import VideoUrlField from "@/components/courses/VideoUrlField";
import {
  createTestimonial,
  updateTestimonial,
  type TestimonialInput,
} from "@/app/(admin)/admin/testimonials/actions";

export interface TestimonialFormValues {
  id: string;
  name: string;
  role: string;
  category: string;
  courseTaken: string | null;
  rating: number;
  quote: string;
  videoUrl: string | null;
  thumbnail: string | null;
  isPublished: boolean;
}

export default function TestimonialForm({
  testimonial,
}: {
  testimonial?: TestimonialFormValues | null;
}) {
  const isEdit = Boolean(testimonial);
  const router = useRouter();

  const [name, setName] = useState(testimonial?.name ?? "");
  const [role, setRole] = useState(testimonial?.role ?? "");
  const [category, setCategory] = useState(testimonial?.category ?? "");
  const [courseTaken, setCourseTaken] = useState(testimonial?.courseTaken ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [quote, setQuote] = useState(testimonial?.quote ?? "");
  const [videoUrl, setVideoUrl] = useState(testimonial?.videoUrl ?? "");
  const [thumbnail, setThumbnail] = useState(testimonial?.thumbnail ?? "");
  const [isPublished, setIsPublished] = useState(testimonial?.isPublished ?? true);

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");
      setThumbnail(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload: TestimonialInput = {
        name,
        role,
        category,
        courseTaken: courseTaken || null,
        rating,
        quote,
        videoUrl: videoUrl || null,
        thumbnail: thumbnail || null,
        isPublished,
      };
      if (isEdit && testimonial) {
        await updateTestimonial(testimonial.id, payload);
        router.push("/admin/testimonials");
        router.refresh();
      } else {
        await createTestimonial(payload);
        router.push("/admin/testimonials");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Student Name *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rakesh Sharma"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Role / Specialization *</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. 3D Artist"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. 3D & Animation (free text)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Course Taken</label>
          <input
            value={courseTaken}
            onChange={(e) => setCourseTaken(e.target.value)}
            placeholder="e.g. Advanced Character Rigging"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Rating</label>
        <div className="flex items-center gap-2">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <span className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
              />
            ))}
          </span>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Testimonial Text *</label>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          rows={4}
          placeholder="What did the student say about their experience?"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <VideoUrlField
        value={videoUrl}
        onChange={setVideoUrl}
        label="Video URL (optional)"
        hint="YouTube, Vimeo, Google Drive, or a direct MP4 link. Leave blank for a text-only testimonial."
      />

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Thumbnail (optional)</label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="Image URL or upload a file"
            className="min-w-[240px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
          </label>
        </div>
        {thumbnail && (
          <div className="relative mt-3 h-40 w-full max-w-sm overflow-hidden rounded-xl border border-slate-200">
            <Image src={thumbnail} alt="Thumbnail preview" fill unoptimized className="object-cover" />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
        />
        Published (visible on the public site)
      </label>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={busy || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-primary-hover disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Saving..." : isEdit ? "Save Changes" : "Create Testimonial"}
        </button>
        <Link
          href="/admin/testimonials"
          className="rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
