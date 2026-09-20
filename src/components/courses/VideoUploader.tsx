"use client";
import { useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function VideoUploader({ lessonId, onUploaded }: { lessonId?: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) {
      setError("File exceeds 1GB limit");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("video", file);
      if (lessonId) formData.append("lessonId", lessonId);

      setProgress(50);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setProgress(100);
      setSuccess(true);
      onUploaded(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center bg-soft-blue/20">
      <input type="file" accept="video/*" onChange={handleUpload} className="hidden" id={`video-upload-${lessonId || 'new'}`} disabled={uploading} />
      <label htmlFor={`video-upload-${lessonId || 'new'}`} className="cursor-pointer flex flex-col items-center justify-center gap-2">
        {uploading ? (
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        ) : success ? (
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        ) : (
          <Upload className="h-8 w-8 text-muted" />
        )}
        <p className="text-sm font-medium text-text">
          {uploading ? `Uploading... ${progress}%` : success ? "Video Uploaded Successfully!" : "Upload Lesson Video (Max 1GB)"}
        </p>
        <p className="text-xs text-muted">MP4, MOV, WebM supported</p>
      </label>
      {error && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-rose-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
