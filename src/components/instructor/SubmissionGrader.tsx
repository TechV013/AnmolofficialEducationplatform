"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { gradeSubmission } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { CheckCircle2 } from "lucide-react";

export default function SubmissionGrader({ submissionId, courseId, initialScore, initialFeedback }: {
  submissionId: string;
  courseId: string;
  initialScore?: number | null;
  initialFeedback?: string | null;
}) {
  const [score, setScore] = useState(initialScore ?? "");
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const save = async () => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await gradeSubmission(submissionId, courseId, Number(score) || 0, feedback.trim());
      setSaved(true);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-blue-200/60 bg-blue-50/50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold text-slate-500">Score</label>
        <input
          type="number"
          min={0}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="e.g. 8/10"
          className="w-24 rounded-lg border px-2 py-1.5 text-sm"
        />
        <label className="text-xs font-semibold text-slate-500">Private feedback</label>
      </div>
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={2}
        placeholder="Feedback for the student..."
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          {busy ? "Saving..." : "Save Grade"}
        </button>
        {saved && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Saved</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  );
}