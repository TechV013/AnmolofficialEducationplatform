"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "3D & Animation",
    level: "Beginner",
    price: 999,
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    whatYouWillLearn: ["Master industry standard tools", "Build real-world projects"],
    requirements: ["Basic computer knowledge"]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create course");
      router.push(`/instructor/courses/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/instructor" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-text mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-text mb-6">Create New Course</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-text mb-2">Course Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Advanced Blender Rigging" />
            </div>
            <div>
              <label className="block text-sm font-bold text-text mb-2">Description</label>
              <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Course overview..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-text mb-2">Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-text bg-white">
                  <option>3D & Animation</option>
                  <option>VFX & Compositing</option>
                  <option>Video Editing</option>
                  <option>Design & UI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Level</label>
                <select value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-text bg-white">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-text mb-2">Price (INR)</label>
                <input type="number" required value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full rounded-xl border border-border px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-text mb-2">Thumbnail URL</label>
              <input type="url" required value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} className="w-full rounded-xl border border-border px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all">
              {loading ? "Creating..." : "Create Course & Add Curriculum →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
