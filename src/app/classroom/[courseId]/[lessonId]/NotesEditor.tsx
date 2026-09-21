"use client";
import { useState, useEffect, useRef } from "react";
import { saveNote } from "../../actions";
import { useToast } from "@/components/ui/Toast";
import { CheckCircle2 } from "lucide-react";

export default function NotesEditor({ lessonId, initialContent }: { lessonId: string; initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const persist = async (text: string) => {
    setSaving(true);
    try {
      await saveNote(lessonId, text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast("Failed to save note", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    setSaved(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => persist(value), 2000);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text">My Notes</h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          {saving && <span>Saving...</span>}
          {saved && (
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Take notes for this lesson... (auto-saves)"
        rows={8}
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
      />
      <p className="text-xs text-muted">Your notes are private and saved automatically.</p>
    </div>
  );
}
