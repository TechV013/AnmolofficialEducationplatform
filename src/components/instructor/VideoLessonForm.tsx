"use client";
import { useRef, useState } from "react";
import { Clock, Loader2, Trash2, Upload, Video, X } from "lucide-react";
import VideoUrlField from "@/components/courses/VideoUrlField";
import { isValidVideoUrl } from "@/lib/video/validateUrl";
import { formatSeconds } from "@/lib/course-studio";
import { createLesson, updateLesson } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

export interface VideoLessonDraft {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string | null;
}

interface VideoLessonFormProps {
  mode: "create" | "edit";
  courseId: string;
  moduleId?: string;
  lesson?: VideoLessonDraft;
  onDone: () => void;
}

export default function VideoLessonForm({ mode, courseId, moduleId, lesson, onDone }: VideoLessonFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [duration, setDuration] = useState(lesson?.duration ?? "");
  const [autoDuration, setAutoDuration] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasVideo = videoUrl.trim().length > 0 && isValidVideoUrl(videoUrl.trim());

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) {
      setError("File exceeds 1GB limit");
      return;
    }

    setUploading(true);
    setError(null);
    setAutoDuration(null);
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

  const handleUrlChange = (value: string) => {
    setVideoUrl(value);
    setAutoDuration(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const finalDuration = autoDuration != null ? formatSeconds(autoDuration) : duration.trim();
      if (mode === "create") {
        await createLesson(moduleId!, title.trim(), description, finalDuration, videoUrl || null, courseId);
      } else {
        await updateLesson(lesson!.id, title.trim(), description, videoUrl || null, courseId, finalDuration || undefined);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-4 shadow-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />

      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-soft-blue text-primary">
          <Video className="h-4 w-4" />
        </span>
        <p className="text-sm font-bold text-text">{mode === "create" ? "New Video Lesson" : "Edit Video Lesson"}</p>
        <button onClick={onDone} className="ml-auto rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-50" title="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Lesson title *"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <VideoUrlField
        label="Lesson Video"
        value={videoUrl}
        onChange={handleUrlChange}
        placeholder="YouTube, Vimeo, Google Drive, or direct MP4 URL"
        hint="Upload a video or paste a playable link. Shown to enrolled students in the classroom player."
        previewClassName="mt-1 overflow-hidden rounded-2xl border border-slate-200 shadow-md w-full max-w-lg"
        onPreviewDuration={setAutoDuration}
        trailing={
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-soft-blue px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-soft-blue/80 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        }
      />

      {hasVideo && (
        <div className="flex flex-wrap items-center gap-3">
          {autoDuration != null ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <Clock className="h-3.5 w-3.5" />
              Duration: {formatSeconds(autoDuration)}
              <span className="font-medium text-emerald-600">(auto-detected)</span>
            </span>
          ) : duration.trim() ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-muted">
              <Clock className="h-3.5 w-3.5" />
              Duration: {duration.trim()}
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-text transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <Upload className="h-3.5 w-3.5" />
            Replace Video
          </button>

          <button
            type="button"
            onClick={() => {
              setVideoUrl("");
              setAutoDuration(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove Video
          </button>
        </div>
      )}

      <input
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Duration (e.g. 12:42) — auto-filled when the video loads"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading || !title.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Saving..." : "Save Lesson"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}