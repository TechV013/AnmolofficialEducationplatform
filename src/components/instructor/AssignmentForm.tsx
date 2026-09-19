"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/app/(instructor)/instructor/courses/[courseId]/actions";

export default function AssignmentForm({ lessonId, courseId }: { lessonId: string; courseId: string }) {
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async () => {
    if (!instructions.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createAssignment(lessonId, instructions.trim(), dueDate || null, courseId);
      setOpen(false);
      setInstructions("");
      setDueDate("");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border-2 border-primary/30 px-4 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        + Add Assignment
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-border bg-white p-4 shadow-sm">
      <h4 className="text-sm font-bold text-slate-800">New Assignment</h4>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Assignment instructions for students"
        rows={3}
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap items-center gap-3">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" />
        <button onClick={submit} disabled={loading} className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
          {loading ? "Saving..." : "Create Assignment"}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600">
          Cancel
        </button>
      </div>
    </div>
  );
}