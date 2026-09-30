"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Trash2, CheckCircle2 } from "lucide-react";
import VideoUrlField from "@/components/courses/VideoUrlField";
import { updateCourseIntroVideo } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

interface IntroVideoFormProps {
  courseId: string;
  initialVideoUrl?: string | null;
}

export default function IntroVideoForm({ courseId, initialVideoUrl }: IntroVideoFormProps) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string>(initialVideoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) {
      setError("Intro video file exceeds 1GB limit");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append("video", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Video upload failed");

      setVideoUrl(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateCourseIntroVideo(courseId, videoUrl || null);
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save intro video");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold text-slate-500">
        This video plays as a preview in the course hero. It is NOT a lesson — it is not part of the curriculum and not counted in lesson progress.
      </p>

      <VideoUrlField
        label="Course Intro Video"
        value={videoUrl}
        onChange={(v) => {
          setVideoUrl(v);
          setSuccess(false);
        }}
        placeholder="YouTube, Vimeo, Google Drive, or direct MP4 URL"
        hint="Shown as a preview on the course page."
        previewClassName="mt-1 overflow-hidden rounded-2xl border border-slate-200 shadow-md w-full max-w-md mx-auto"
        trailing={
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-soft-blue text-primary font-semibold text-xs hover:bg-soft-blue/80 transition-colors shrink-0">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{uploading ? "Uploading..." : "Upload Video"}</span>
            <input type="file" accept="video/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        }
      />

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {success && (
        <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Intro video saved successfully!
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {videoUrl && (
          <button
            type="button"
            onClick={() => setVideoUrl("")}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove Video
          </button>
        )}
      </div>
    </div>
  );
}