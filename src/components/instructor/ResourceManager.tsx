"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ResourceForm from "./ResourceForm";
import { deleteResource } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { FileText, Paperclip, Trash2, Pencil, ExternalLink } from "lucide-react";

interface ResourceItem {
  id: string;
  title: string;
  type: string;
  url: string;
}

const TYPE_ICON: Record<string, typeof FileText> = {
  PDF: FileText,
  DOCUMENT: FileText,
  PROJECT_FILE: Paperclip,
  EXTERNAL_LINK: ExternalLink,
};

export default function ResourceManager({ lessonId, courseId, resources }: {
  lessonId: string;
  courseId: string;
  resources: ResourceItem[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const editResource = resources.find((r) => r.id === editing);

  return (
    <div className="space-y-2">
      {resources.length > 0 && (
        <ul className="space-y-1.5">
          {resources.map((r) => {
            const Icon = TYPE_ICON[r.type] || FileText;
            return (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-white px-3 py-2 text-sm">
                <a href={r.url || "#"} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-slate-700 hover:text-primary">
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate font-medium">{r.title}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{r.type}</span>
                </a>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => setEditing(editing === r.id ? null : r.id)} className="text-xs text-slate-500 hover:text-primary">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <form action={async () => { await deleteResource(r.id, courseId); router.refresh(); }}>
                    <button className="text-xs text-red-500 hover:text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && editResource ? (
        <ResourceForm
          lessonId={lessonId}
          courseId={courseId}
          initialData={{ id: editResource.id, title: editResource.title, type: editResource.type as "PDF" | "DOCUMENT" | "PROJECT_FILE" | "EXTERNAL_LINK", url: editResource.url }}
          onSuccess={() => { setEditing(null); router.refresh(); }}
        />
      ) : adding ? (
        <ResourceForm
          lessonId={lessonId}
          courseId={courseId}
          onSuccess={() => { setAdding(false); router.refresh(); }}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          + Add Resource (PDF / link)
        </button>
      )}
    </div>
  );
}