"use client";
import { useState } from "react";
import { createModule } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

interface Props {
  courseId?: string;
}

export default function ModuleForm({ courseId }: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setLoading(true);
    try {
      await createModule(courseId, title);
      setTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white rounded-xl shadow border border-border">
      <h3 className="font-bold text-text">Create Module</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Module Title" className="w-full px-3 py-2 rounded border" required />
      <button disabled={loading} className="w-full bg-primary text-white py-2 rounded font-medium">{loading ? "Saving..." : "Create Module"}</button>
    </form>
  );
}