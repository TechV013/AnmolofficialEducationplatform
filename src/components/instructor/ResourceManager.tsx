"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ResourceForm from "./ResourceForm";
import { deleteResource } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { isDownloadableResourceUrl } from "@/lib/resource/resourceLink";
import { FileText, Paperclip, Trash2, Pencil, ExternalLink, Download } from "lucide-react";

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

const EXT_LABEL: Record<string, string> = {
  pdf: "PDF",
  doc: "DOC", docx: "DOCX",
  ppt: "PPT", pptx: "PPTX",
  xls: "XLS", xlsx: "XLSX",
  csv: "CSV", txt: "TXT", md: "MD", rtf: "RTF",
  zip: "ZIP",
  png: "PNG", jpg: "JPG", jpeg: "JPG", webp: "WEBP", gif: "GIF", svg: "SVG",
  mp4: "MP4", webm: "WEBM", mov: "MOV",
};

/** Uploaded files live on our own origin, so they get a real download. */

/**
 * Shows the real file kind when we can infer it from the extension, so PPTX and
 * ZIP read correctly instead of always falling back to the coarse enum label.
 */
function typeLabel(resource: ResourceItem): string {
  if (resource.type === "EXTERNAL_LINK") return "Link";
  const path = resource.url.split("?")[0].split("#")[0];
  const base = path.split("/").pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return resource.type;
  return EXT_LABEL[base.slice(dot + 1).toLowerCase()] ?? resource.type;
}

export default function ResourceManager({ lessonId, courseId, resources, emptyHint }: {
  lessonId: string;
  courseId: string;
  resources: ResourceItem[];
  emptyHint?: string;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  // Tracks the rendered list so a resource added to a lesson created moments ago
  // appears at once; the server render does not include that lesson yet.
  const [added, setAdded] = useState<ResourceItem[]>([]);

  const items = [...resources, ...added.filter((a) => !resources.some((r) => r.id === a.id))];
  const editResource = items.find((r) => r.id === editing);

  const onFormSuccess = (created?: ResourceItem) => {
    if (created) setAdded((prev) => [...prev, created]);
    setAdding(false);
    setEditing(null);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((r) => {
            const Icon = TYPE_ICON[r.type] || FileText;
            const hosted = isDownloadableResourceUrl(r.url);
            const label = typeLabel(r);
            return (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-white px-3 py-2 text-sm">
                <a
                  href={r.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 items-center gap-2 text-slate-700 hover:text-primary"
                >
                  <Icon className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate font-medium">{r.title}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">{label}</span>
                </a>
                <div className="flex shrink-0 items-center gap-2">
                  {hosted ? (
                    <a
                      href={r.url || "#"}
                      download
                      title={`Download ${r.title}`}
                      aria-label={`Download ${r.title}`}
                      className="text-slate-500 hover:text-primary"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <a
                      href={r.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Open ${r.title}`}
                      aria-label={`Open ${r.title}`}
                      className="text-slate-500 hover:text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => setEditing(editing === r.id ? null : r.id)}
                    title="Edit"
                    aria-label={`Edit ${r.title}`}
                    className="text-xs text-slate-500 hover:text-primary"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <form action={async () => {
                    await deleteResource(r.id, courseId);
                    // Drop the local copy too, otherwise a just-added resource
                    // would reappear after its row is gone from the database.
                    setAdded((prev) => prev.filter((a) => a.id !== r.id));
                    router.refresh();
                  }}>
                    <button title="Remove" aria-label={`Remove ${r.title}`} className="text-xs text-red-500 hover:text-red-700">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {items.length === 0 && emptyHint && !adding && (
        <p className="text-xs text-muted">{emptyHint}</p>
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
          onSuccess={onFormSuccess}
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
