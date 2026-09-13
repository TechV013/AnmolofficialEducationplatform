"use client";
import { useState } from "react";
import { updateLesson } from "@/app/instructor/courses/[courseId]/actions";
import { useRouter } from "next/navigation";

interface LessonEditFormProps {
  lessonId: string;
  courseId: string;
  initialTitle: string;
  initialDescription: string;
  initialVideoUrl: string | null;
}

export default function LessonEditForm({ 
  lessonId, 
  courseId, 
  initialTitle, 
  initialDescription, 
  initialVideoUrl 
}: LessonEditFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await updateLesson(lessonId, title, description, videoUrl === "" ? null : videoUrl, courseId);
      setSuccess(true);
      // Optionally reset form or refresh
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-4 rounded-xl border border-border/50 mb-4">
      <h2 className="font-bold mb-2">Edit Lesson</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Lesson updated successfully!</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded-lg bg-background"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Video URL (optional)</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter HTTPS URL or leave empty"
            className="w-full p-2 border rounded-lg bg-background"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Lesson"}
        </button>
      </form>
    </div>
  );
}