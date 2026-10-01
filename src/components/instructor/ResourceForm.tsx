"use client";
import { useRef, useState } from "react";
import { createResource, updateResource } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { FileText, Loader2, Paperclip, ExternalLink, Upload, X } from "lucide-react";

interface Props {
  lessonId: string;
  courseId: string;
  initialData?: { id: string; title: string; type: ResourceType; url: string };
  onSuccess: () => void;
}

type ResourceType = "PDF" | "DOCUMENT" | "PROJECT_FILE" | "EXTERNAL_LINK";

const TYPE_OPTIONS: { value: ResourceType; label: string }[] = [
  { value: "PDF", label: "PDF" },
  { value: "DOCUMENT", label: "Document" },
  { value: "PROJECT_FILE", label: "Project File" },
  { value: "EXTERNAL_LINK", label: "External Link" }
];

const TYPE_ICON: Record<ResourceType, typeof FileText> = {
  PDF: FileText,
  DOCUMENT: FileText,
  PROJECT_FILE: Paperclip,
  EXTERNAL_LINK: ExternalLink
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileNameFromUrl(url: string): string {
  const clean = url.split("?")[0].split("/").pop() || url;
  return decodeURIComponent(clean);
}

export default function ResourceForm({ lessonId, courseId, initialData, onSuccess }: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<ResourceType>(initialData?.type || "PDF");
  const [url, setUrl] = useState(initialData?.url || "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploadable = type !== "EXTERNAL_LINK";
  const Icon = TYPE_ICON[type];

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "File upload failed");

      setUrl(data.url);
      setFileName(data.fileName || file.name);
      setFileSize(file.size);
      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setUrl("");
    setFileName(null);
    setFileSize(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError(isUploadable ? "Upload a file or paste a link first" : "Paste a link first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (initialData) {
        await updateResource(initialData.id, title, type, url, courseId);
      } else {
        await createResource(lessonId, title, type, url, courseId);
      }
      onSuccess();
      if (!initialData) {
        setTitle("");
        setUrl("");
        setFileName(null);
        setFileSize(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save resource");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-muted">
        {initialData ? "Edit Resource" : "Add Resource"}
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title *"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />

      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value as ResourceType);
          clearFile();
        }}
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {isUploadable && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 px-4 py-3 text-xs font-bold text-primary transition-colors hover:bg-soft-blue/40 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </div>
      )}

      {url && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-slate-50 px-3 py-2.5">
          <Icon className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-text">
              {fileName ?? fileNameFromUrl(url)}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              {type}
              {fileSize !== null ? ` · ${formatSize(fileSize)}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-white hover:text-rose-500"
            title="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          value={url.startsWith("/uploads/") ? "" : url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={isUploadable ? "or paste a public file link" : "Paste URL *"}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          required={type === "EXTERNAL_LINK"}
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <button
        disabled={loading || uploading || !title.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {initialData ? "Update Resource" : "Save Resource"}
      </button>
    </form>
  );
}
