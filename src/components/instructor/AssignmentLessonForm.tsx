"use client";
import { useState } from "react";
import { ClipboardList, Loader2, Trash2, X } from "lucide-react";
import {
  createAssignmentLesson,
  updateAssignment,
  updateLesson,
  deleteAssignment
} from "@/app/(instructor)/instructor/courses/[courseId]/actions";

export interface AssignmentLessonDraft {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  assignment: { id: string; instructions: string; dueDate: string | null } | null;
}

interface AssignmentLessonFormProps {
  mode: "create" | "edit";
  courseId: string;
  moduleId?: string;
  lesson?: AssignmentLessonDraft;
  onDone: () => void;
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA");
}

export default function AssignmentLessonForm({ mode, courseId, moduleId, lesson, onDone }: AssignmentLessonFormProps) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [instructions, setInstructions] = useState(lesson?.assignment?.instructions ?? "");
  const [dueDate, setDueDate] = useState(toDateInput(lesson?.assignment?.dueDate));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = title.trim().length > 0 && instructions.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        await createAssignmentLesson(moduleId!, title.trim(), description, instructions.trim(), dueDate || null, courseId);
      } else {
        await updateLesson(lesson!.id, title.trim(), description, lesson!.videoUrl, courseId);
        await updateAssignment(lesson!.assignment!.id, instructions.trim(), dueDate || null, courseId);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== "edit" || !lesson?.assignment) return;
    if (!window.confirm("Delete this assignment content? The lesson will remain.")) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAssignment(lesson.assignment.id, courseId);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete assignment");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-soft-blue text-primary">
          <ClipboardList className="h-4 w-4" />
        </span>
        <p className="text-sm font-bold text-text">{mode === "create" ? "New Assignment Lesson" : "Edit Assignment Lesson"}</p>
        <button onClick={onDone} className="ml-auto rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-50" title="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Lesson title *"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="Assignment instructions for students *"
        rows={4}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Due date (optional)</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || deleting || !canSave}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {saving ? "Saving..." : "Save Assignment"}
        </button>
        {mode === "edit" && lesson?.assignment && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-60"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {deleting ? "Deleting..." : "Delete Assignment"}
          </button>
        )}
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}