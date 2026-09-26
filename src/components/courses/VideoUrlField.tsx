"use client";
import { useEffect, useState, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { isValidVideoUrl } from "@/lib/video/validateUrl";
import VideoPlayer from "@/components/video/VideoPlayer";

interface VideoUrlFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  hint?: string;
  trailing?: ReactNode;
}

const DEBOUNCE_MS = 400;

export default function VideoUrlField({ value, onChange, label = "Video URL", placeholder = "YouTube, Vimeo, or direct MP4 URL", hint, trailing }: VideoUrlFieldProps) {
  const trimmed = value.trim();
  const invalid = trimmed.length > 0 && !isValidVideoUrl(trimmed);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!trimmed || !isValidVideoUrl(trimmed)) {
      setPreviewUrl(null);
      return;
    }
    const t = setTimeout(() => setPreviewUrl(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [trimmed]);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {trailing}
      </div>
      {invalid && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <AlertCircle className="h-3.5 w-3.5" />
          This doesn't look like a playable video URL — use a YouTube/Vimeo link or a direct MP4 URL.
        </p>
      )}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {previewUrl && (
        <div className="mt-1 overflow-hidden rounded-2xl border border-slate-200 shadow-md">
          <VideoPlayer key={previewUrl} url={previewUrl} title={label} mode="preview" />
        </div>
      )}
    </div>
  );
}