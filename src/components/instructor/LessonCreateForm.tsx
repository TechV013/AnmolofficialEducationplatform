"use client";
import { useState } from "react";
import { createLesson } from "@/app/instructor/courses/[courseId]/actions";

interface LessonCreateFormProps {
  moduleId: string;
  courseId: string;
}

export default function LessonCreateForm({ moduleId, courseId }: LessonCreateFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createLesson(moduleId, title, description, duration, courseId);
      // Reset form
      setTitle("");
      setDescription("");
      setDuration("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-4 rounded-xl border border-border/50 mb-4">
      <h2 className="font-bold mb-2">Add Lesson to Module</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
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
          <label className="block font-medium mb-1">Duration (e.g., 10:00)</label>
          <input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Optional"
            className="w-full p-2 border rounded-lg bg-background"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Lesson"}
        </button>
      </form>
    </div>
  );
}