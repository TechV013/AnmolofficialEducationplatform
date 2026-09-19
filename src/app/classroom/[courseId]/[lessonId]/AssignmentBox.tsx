"use client";
import { useState } from "react";
import { submitAssignment } from "../../actions";

export default function AssignmentBox({ assignmentId, instructions, submitted }: {
  assignmentId: string;
  instructions: string;
  submitted: boolean;
}) {
  const [content, setContent] = useState("");
  const [done, setDone] = useState(submitted);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      if (!content.trim()) throw new Error("Write something before submitting.");
      await submitAssignment(assignmentId, content.trim());
      setDone(true);
      setContent("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 p-6 bg-surface rounded-2xl border border-border">
      <h2 className="font-bold text-text text-lg mb-2">Assignment</h2>
      <p className="text-sm text-slate-600 mb-4">{instructions}</p>
      {done ? (
        <p className="text-sm font-semibold text-green-600">✓ Assignment submitted. You can submit again below.</p>
      ) : null}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={4}
        disabled={busy}
        placeholder="Type your assignment response..."
        className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-white mb-3"
      />
      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={busy} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-primary-hover transition-colors disabled:opacity-60">
          {busy ? "Submitting..." : "Submit Assignment"}
        </button>
        {error && <p className="text-red-500 text-xs">{error}</p>}
      </div>
    </div>
  );
}