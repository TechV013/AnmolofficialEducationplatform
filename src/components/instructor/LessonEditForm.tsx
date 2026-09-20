"use client";
import { useState } from "react";
import { updateLesson } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  lessonId: string;
  courseId: string;
  initialTitle: string;
  initialDescription: string;
  initialVideoUrl?: string | null;
}

export default function LessonEditForm({ lessonId, courseId, initialTitle, initialDescription, initialVideoUrl }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || "");
  const [loading, setLoading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 1024) {
      alert("Video file exceeds 1GB limit");
      return;
    }

    setUploadingVideo(true);
    setUploadProgress(25);
    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("lessonId", lessonId);

      setUploadProgress(50);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Video upload failed");

      setUploadProgress(100);
      setVideoUrl(data.videoUrl);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateLesson(lessonId, title, description, videoUrl || null, courseId);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white rounded-xl shadow border border-border">
      <h3 className="font-bold text-text">Edit Lesson</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded border text-sm" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded border text-sm" />
      
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500">Lesson Video (URL or Local Upload up to 1GB)</label>
        <div className="flex items-center gap-2">
          <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Video URL or uploaded path" className="flex-1 px-3 py-2 rounded border text-sm" />
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded bg-soft-blue text-primary font-semibold text-xs hover:bg-soft-blue/80 transition-colors shrink-0">
            {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span>{uploadingVideo ? `Uploading...` : "Upload Video"}</span>
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
          </label>
        </div>
        {videoUrl && <p className="text-xs text-emerald-600 font-medium">✓ Video attached: {videoUrl}</p>}
      </div>

      <button disabled={loading || uploadingVideo} className="w-full bg-primary text-white py-2 rounded font-medium text-sm transition-opacity hover:bg-primary-hover disabled:opacity-60">
        {loading ? "Saving..." : "Update Lesson"}
      </button>
    </form>
  );
}
