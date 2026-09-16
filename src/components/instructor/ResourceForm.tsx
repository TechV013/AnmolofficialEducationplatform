"use client";
import { useState } from "react";
import { createResource, updateResource } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

interface Props {
  lessonId: string;
  courseId: string;
  initialData?: { id: string; title: string; type: 'PDF' | 'DOCUMENT' | 'PROJECT_FILE' | 'EXTERNAL_LINK'; url: string };
  onSuccess: () => void;
}

export default function ResourceForm({ lessonId, courseId, initialData, onSuccess }: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<any>(initialData?.type || "PDF");
  const [url, setUrl] = useState(initialData?.url || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await updateResource(initialData.id, title, type, url, courseId);
      } else {
        await createResource(lessonId, title, type, url, courseId);
      }
      onSuccess();
      if (!initialData) { setTitle(""); setUrl(""); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white rounded-xl shadow border border-border">
      <h3 className="font-bold text-text">{initialData ? "Edit" : "Create"} Resource</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-3 py-2 rounded border" required />
      <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 rounded border"><option value="PDF">PDF</option><option value="DOCUMENT">Document</option><option value="PROJECT_FILE">Project File</option><option value="EXTERNAL_LINK">External Link</option></select>
      <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" className="w-full px-3 py-2 rounded border" required />
      <button disabled={loading} className="w-full bg-primary text-white py-2 rounded font-medium">{loading ? "Saving..." : "Save Resource"}</button>
    </form>
  );
}