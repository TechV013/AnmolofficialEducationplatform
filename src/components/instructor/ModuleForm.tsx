"use client";
import { useState } from "react";
import { createModule } from "@/app/instructor/courses/[courseId]/actions";

export default function ModuleForm({ courseId }: { courseId: string }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createModule(courseId, title);
    setTitle("");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New Module Title"
        className="flex-1 p-2 border border-border rounded-lg"
        required
      />
      <button disabled={loading} className="bg-primary text-white px-4 py-2 rounded-lg font-bold">
        {loading ? "Adding..." : "+ Add Module"}
      </button>
    </form>
  );
}
