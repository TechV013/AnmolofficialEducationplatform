"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Loader2 } from "lucide-react";

export default function PublishButton({ courseId, initialStatus }: { courseId: string; initialStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isPublished = initialStatus === "PUBLISHED";

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/publish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update course status");
      }
      router.refresh();
      alert(isPublished ? "Course unpublished successfully." : "Course published successfully and is now live on the platform!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to publish course. Please ensure you have added at least one module and one lesson.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-60 ${
        isPublished ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
      }`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
      <span>{isPublished ? "Unpublish" : "Publish Course"}</span>
    </button>
  );
}
