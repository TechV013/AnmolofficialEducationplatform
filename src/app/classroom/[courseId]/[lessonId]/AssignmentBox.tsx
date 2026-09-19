"use client";
import { useState } from "react";
import { submitAssignment } from "../../actions";
import { CheckCircle2, Award } from "lucide-react";

interface Submission {
  id: string;
  fileUrl: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "REVIEWED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
        <Award className="h-3.5 w-3.5" /> Graded
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
      Awaiting review
    </span>
  );
}

export default function AssignmentBox({ assignment }: {
  assignment: { id: string; instructions: string; submission?: Submission | null };
}) {
  const [content, setContent] = useState("");
  const [done, setDone] = useState(Boolean(assignment.submission));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submission = assignment.submission || null;

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (!content.trim()) throw new Error("Write something before submitting.");
      await submitAssignment(assignment.id, content.trim());
      setDone(true);
      setContent("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 space-y-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text">Assignment</h2>
        {submission && <StatusBadge status={submission.status} />}
      </div>
      <p className="text-sm text-slate-600">{assignment.instructions}</p>

      {submission?.status === "REVIEWED" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {submission.score !== null ? `Score: ${submission.score}` : "Reviewed"}
          </p>
          {submission.feedback && <p className="mt-1 text-sm text-slate-700">{submission.feedback}</p>}
        </div>
      )}

      {done ? (
        <p className="text-sm font-semibold text-green-600">✓ Assignment submitted. You can submit an updated response below.</p>
      ) : null}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        disabled={busy}
        placeholder="Type your assignment response..."
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm mb-3"
      />
      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={busy} className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60">
          {busy ? "Submitting..." : "Submit Assignment"}
        </button>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    </div>
  );
}