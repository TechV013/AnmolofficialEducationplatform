"use client";
import { useState } from "react";
import { createLesson } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import VideoUrlField from "@/components/courses/VideoUrlField";

interface Props {
  moduleId: string;
  courseId: string;
}

export default function LessonCreateForm({ moduleId, courseId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) {
      alert("Video file exceeds 1GB limit");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setVideoUrl(data.videoUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") || "");
    const description = String(form.get("description") || "");
    const duration = String(form.get("duration") || "");
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createLesson(moduleId, title, description, duration, videoUrl || null, courseId);
      e.currentTarget.reset();
      setVideoUrl("");
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input name="duration" placeholder="Duration (e.g. 12:30)" className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <VideoUrlField
        label="Lesson Video"
        value={videoUrl}
        onChange={setVideoUrl}
        placeholder="YouTube, Vimeo, or direct MP4 URL"
        hint="Paste a YouTube/Vimeo link or a direct MP4 URL, or upload a file."
        trailing={
          <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 rounded bg-soft-blue text-primary font-semibold text-xs hover:bg-soft-blue/80 transition-colors shrink-0">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{uploading ? "Uploading..." : "Upload"}</span>
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploading} />
          </label>
        }
      />
      <div className="flex gap-2 pt-2">
        <button disabled={loading || uploading} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          {loading ? "Saving..." : "Create Lesson"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600">
          Cancel
        </button>
      </div>
    </form>
  );
}
