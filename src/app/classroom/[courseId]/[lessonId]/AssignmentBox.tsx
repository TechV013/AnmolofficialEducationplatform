"use client";
import { useState } from "react";
import { submitAssignment } from "../../actions";
import { CheckCircle2, Award, CalendarClock, Paperclip, X, Loader2, Download } from "lucide-react";

interface Submission {
  id: string;
  fileUrl: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
}

function isHostedFile(url: string): boolean {
  return url.startsWith("/uploads/") || url.startsWith("data:") || url.startsWith("http://localhost");
}

function formatDueDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "REVIEWED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
        <Award className="h-3.5 w-3.5" /> Graded
      </span>
    );
  }
  if (status === "SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
        <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
      Not submitted
    </span>
  );
}

export default function AssignmentBox({ assignment, now }: {
  assignment: { id: string; instructions: string; dueDate: string | null; submission?: Submission | null };
  now: number;
}) {
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submission = assignment.submission || null;
  const [done, setDone] = useState(Boolean(submission));

  const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
  // `now` is captured server-side: reading the clock during render is impure, and
  // setting it from an effect triggers a cascading render.
  const overdue = Boolean(
    due && !Number.isNaN(due.getTime()) && due.getTime() < now && submission?.status !== "REVIEWED"
  );
  const busyAny = busy || uploading;

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignment.id);
      const res = await fetch("/api/assignment-submission", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFileUrl(data.url);
      setFileName(data.fileName || file.name);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError(null);
    if (!content.trim() && !fileUrl) {
      setError("Write a response or attach a file before submitting.");
      return;
    }
    setBusy(true);
    try {
      await submitAssignment(assignment.id, content.trim(), fileUrl);
      setDone(true);
      setContent("");
      setFileUrl(null);
      setFileName(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-10 space-y-4 rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-text">Assignment</h2>
        <div className="flex items-center gap-2">
          {assignment.dueDate && (
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${overdue ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"}`}>
              <CalendarClock className="h-3.5 w-3.5" />
              {overdue ? "Overdue" : "Due"} {formatDueDate(assignment.dueDate)}
            </span>
          )}
          {submission && <StatusBadge status={submission.status} />}
        </div>
      </div>

      <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{assignment.instructions}</div>

      {submission?.status === "REVIEWED" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {submission.score !== null ? `Score: ${submission.score}` : "Reviewed"}
          </p>
          {submission.feedback && <p className="mt-1 text-sm text-slate-700">{submission.feedback}</p>}
        </div>
      )}

      {submission?.fileUrl && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5">
          <Paperclip className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-text">Submitted file</span>
          {isHostedFile(submission.fileUrl) ? (
            <a href={submission.fileUrl} download aria-label="Download your submission" className="text-muted hover:text-primary">
              <Download className="h-4 w-4" />
            </a>
          ) : (
            <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" aria-label="Open your submission" className="text-xs font-semibold text-primary">
              Open
            </a>
          )}
        </div>
      )}

      {done && (
        <p className="text-sm font-semibold text-green-600">✓ Assignment submitted. You can update your response below.</p>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        disabled={busyAny}
        placeholder="Type your assignment response..."
        className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm disabled:opacity-60"
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-bold text-muted transition-colors hover:bg-slate-50 disabled:opacity-60">
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Paperclip className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : "Attach File"}
          <input
            type="file"
            className="hidden"
            disabled={busyAny}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </label>

        {fileUrl && (
          <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <Paperclip className="h-3 w-3 shrink-0" />
            <span className="max-w-[16rem] truncate">{fileName ?? "Attached file"}</span>
            <button
              onClick={() => { setFileUrl(null); setFileName(null); }}
              aria-label="Remove attached file"
              className="text-slate-400 hover:text-rose-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}

        <button
          onClick={submit}
          disabled={busyAny}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {busy ? "Submitting..." : done ? "Update Submission" : "Submit Assignment"}
        </button>
        {error && <p className="w-full text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
