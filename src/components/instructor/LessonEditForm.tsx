"use client";
import { useState } from "react";
import { updateLesson } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded border" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded border" />
      <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="Video URL (optional)" className="w-full px-3 py-2 rounded border" />
      <button disabled={loading} className="w-full bg-primary text-white py-2 rounded font-medium">{loading ? "Saving..." : "Update Lesson"}</button>
    </form>
  );
}