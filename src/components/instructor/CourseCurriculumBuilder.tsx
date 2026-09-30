"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Film,
  Video,
  ClipboardList,
  Brain,
  FileText,
  X,
  Clock
} from "lucide-react";
import VideoLessonForm from "@/components/instructor/VideoLessonForm";
import AssignmentLessonForm from "@/components/instructor/AssignmentLessonForm";
import { QuizEditor } from "@/components/instructor/QuizEditor";
import {
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  createQuiz
} from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { deriveLessonKind, LESSON_KIND_META, padNumber, sumDurations } from "@/lib/course-studio";

export interface StudioLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  position: number;
  videoUrl: string | null;
  quizId: string | null;
  quiz: {
    id: string;
    questions: { id: string; text: string; options: { id: string; text: string; isCorrect: boolean }[] }[];
  } | null;
  assignmentId: string | null;
  assignment: { id: string; instructions: string; dueDate: string | null } | null;
  hasResources: boolean;
}

export interface StudioModule {
  id: string;
  title: string;
  position: number;
  lessons: StudioLesson[];
}

type AddLessonType = "video" | "quiz" | "assignment" | "resource";

const ADD_LESSON_TYPES: { id: AddLessonType; label: string; icon: typeof Video; hint: string }[] = [
  { id: "video", label: "Video", icon: Video, hint: "A recorded lesson" },
  { id: "assignment", label: "Assignment", icon: ClipboardList, hint: "Practical task to complete" },
  { id: "quiz", label: "Quiz", icon: Brain, hint: "Knowledge check" },
  { id: "resource", label: "Resource", icon: FileText, hint: "PDF, document or file" }
];

interface CurriculumBuilderProps {
  courseId: string;
  modules: StudioModule[];
}

export default function CourseCurriculumBuilder({ courseId, modules }: CurriculumBuilderProps) {
  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => a.position - b.position),
    [modules]
  );

  return (
    <div className="space-y-6">
      {sortedModules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center text-muted">
          <Film className="h-10 w-10 text-muted/40 mx-auto mb-3" />
          <p className="font-semibold text-text">No modules created yet</p>
          <p className="text-xs text-muted mt-1">Add your first module below to start building the curriculum.</p>
        </div>
      ) : (
        sortedModules.map((module, index) => (
          <ModuleCard key={module.id} courseId={courseId} module={module} index={index} />
        ))
      )}

      <AddModuleForm courseId={courseId} />
    </div>
  );
}

function ModuleCard({ courseId, module, index }: { courseId: string; module: StudioModule; index: number }) {
  const router = useRouter();
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [savingTitle, setSavingTitle] = useState(false);
  const [autoEditLessonId, setAutoEditLessonId] = useState<string | null>(null);

  const lessons = useMemo(
    () => [...module.lessons].sort((a, b) => a.position - b.position),
    [module.lessons]
  );
  const totalDuration = useMemo(() => sumDurations(lessons.map((l) => l.duration)), [lessons]);

  const handleSaveTitle = async () => {
    if (!title.trim()) return;
    setSavingTitle(true);
    try {
      await updateModule(module.id, title.trim(), courseId);
      setEditingTitle(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete module "${module.title}" and all its lessons? This cannot be undone.`)) return;
    try {
      await deleteModule(module.id, courseId);
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-slate-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {editingTitle ? (
            <div className="flex flex-1 min-w-0 items-center gap-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                disabled={savingTitle}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                {savingTitle ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckIcon />}
                Save
              </button>
              <button
                onClick={() => {
                  setEditingTitle(false);
                  setTitle(module.title);
                }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted transition-colors hover:bg-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="min-w-0">
              <h3 className="font-bold text-text">
                Module {index + 1} — {module.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span>{lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}</span>
                {totalDuration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {totalDuration}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => setEditingTitle(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-text transition-colors hover:bg-soft-blue/40"
              title="Edit module"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100"
              title="Delete module"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 p-5">
        {lessons.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted">No lessons in this module yet.</p>
        ) : (
          lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} courseId={courseId} initialEditing={autoEditLessonId === lesson.id} />
          ))
        )}

        <AddLessonFlow
          moduleId={module.id}
          courseId={courseId}
          onLessonCreated={(lessonId) => setAutoEditLessonId(lessonId)}
        />
      </div>
    </div>
  );
}

function LessonRow({ lesson, courseId, initialEditing = false }: { lesson: StudioLesson; courseId: string; initialEditing?: boolean }) {
  const router = useRouter();
  const kind = deriveLessonKind({
    videoUrl: lesson.videoUrl,
    quiz: lesson.quizId ? { id: lesson.quizId } : null,
    assignment: lesson.assignmentId ? { id: lesson.assignmentId } : null,
    resources: lesson.hasResources ? [{}] : []
  });
  const kindMeta = LESSON_KIND_META[kind];
  const [editing, setEditing] = useState(initialEditing);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateLesson(lesson.id, title.trim(), description, lesson.videoUrl, courseId);
      setEditing(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete lesson "${lesson.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteLesson(lesson.id, courseId);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    if (kind === "video") {
      return (
        <VideoLessonForm
          mode="edit"
          courseId={courseId}
          lesson={{ id: lesson.id, title: lesson.title, description: lesson.description, duration: lesson.duration, videoUrl: lesson.videoUrl }}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      );
    }

    if (kind === "assignment") {
      return (
        <AssignmentLessonForm
          mode="edit"
          courseId={courseId}
          lesson={{ id: lesson.id, title: lesson.title, description: lesson.description, videoUrl: lesson.videoUrl, assignment: lesson.assignment }}
          onDone={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      );
    }

    if (kind === "quiz" && lesson.quiz) {
      return (
        <div className="space-y-4 rounded-xl border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-soft-blue text-xs font-bold text-primary">
              {padNumber(lesson.position + 1)}
            </span>
            <p className="text-sm font-bold text-text">Edit Quiz Lesson</p>
            <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold ${kindMeta.badge}`}>
              {kindMeta.icon} {kindMeta.label}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lesson title *"
              className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Lesson Details"}
            </button>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Quiz Editor</p>
            <QuizEditor quiz={lesson.quiz} courseId={courseId} />
          </div>

          <button
            onClick={() => {
              setEditing(false);
              router.refresh();
            }}
            className="rounded-full border border-border px-4 py-2 text-xs font-bold text-muted transition-colors hover:bg-slate-50"
          >
            Close Editor
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3 rounded-xl border border-border bg-slate-50/50 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-soft-blue text-xs font-bold text-primary">
            {padNumber(lesson.position + 1)}
          </span>
          <p className="text-sm font-bold text-text">Edit Lesson</p>
          <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold ${kindMeta.badge}`}>
            {kindMeta.icon} {kindMeta.label}
          </span>
        </div>
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-full border border-border px-4 py-1.5 text-xs font-bold text-muted transition-colors hover:bg-white"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const hasVideo = Boolean(lesson.videoUrl);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-slate-50/50 px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-soft-blue text-xs font-bold text-primary">
        {padNumber(lesson.position + 1)}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-text">{lesson.title}</p>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${kindMeta.badge}`}>
            {kindMeta.icon} {kindMeta.label}
          </span>
          {hasVideo && <span className="text-[10px] font-semibold text-emerald-600">✓ Video attached</span>}
          {kind === "quiz" && lesson.quiz && (
            <span className="text-[10px] font-semibold text-muted">
              {lesson.quiz.questions.length} {lesson.quiz.questions.length === 1 ? "question" : "questions"}
            </span>
          )}
        </div>
        {lesson.description && (
          <p className="mt-0.5 truncate text-xs text-muted">{lesson.description}</p>
        )}
        {!hasVideo && kind === "text" && (
          <p className="mt-0.5 text-[10px] font-semibold text-amber-600">No content added yet</p>
        )}
      </div>

      {lesson.duration && (
        <span className="hidden shrink-0 text-xs text-muted sm:block">{lesson.duration}</span>
      )}

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg p-2 text-muted transition-colors hover:bg-white hover:text-text"
          title="Edit lesson"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50"
          title="Delete lesson"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function AddLessonFlow({ moduleId, courseId, onLessonCreated }: { moduleId: string; courseId: string; onLessonCreated?: (lessonId: string) => void }) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "choose" | "form">("idle");
  const [type, setType] = useState<AddLessonType>("video");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setStep("idle");
    setTitle("");
    setDescription("");
    setDuration("");
    setError(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const lessonId = await createLesson(moduleId, title.trim(), description, duration || "", null, courseId);
      if (type === "quiz") {
        await createQuiz(lessonId, courseId);
      }
      reset();
      onLessonCreated?.(lessonId);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create lesson");
    } finally {
      setSaving(false);
    }
  };

  if (step === "idle") {
    return (
      <div className="pt-2">
        <button
          onClick={() => setStep("choose")}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-primary/40 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" />
          Add Lesson
        </button>
      </div>
    );
  }

  if (step === "choose") {
    return (
      <div className="space-y-2.5 pt-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">Lesson type</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {ADD_LESSON_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id);
                  setStep("form");
                }}
                className="group rounded-xl border border-border bg-white p-3 text-left transition-colors hover:border-primary/50 hover:bg-soft-blue/30"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-soft-blue text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-2 text-xs font-bold text-text">{t.label}</p>
                <p className="text-[10px] text-muted">{t.hint}</p>
              </button>
            );
          })}
        </div>
        <button onClick={reset} className="text-xs font-semibold text-muted hover:text-text">
          Cancel
        </button>
      </div>
    );
  }

  if (type === "video") {
    return (
      <VideoLessonForm
        mode="create"
        moduleId={moduleId}
        courseId={courseId}
        onDone={() => {
          reset();
          router.refresh();
        }}
      />
    );
  }

  if (type === "assignment") {
    return (
      <AssignmentLessonForm
        mode="create"
        moduleId={moduleId}
        courseId={courseId}
        onDone={() => {
          reset();
          router.refresh();
        }}
      />
    );
  }

  const TypeIcon = ADD_LESSON_TYPES.find((t) => t.id === type)?.icon ?? Video;

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-soft-blue text-primary">
          <TypeIcon className="h-4 w-4" />
        </span>
        <p className="text-sm font-bold text-text">New {ADD_LESSON_TYPES.find((t) => t.id === type)?.label} Lesson</p>
        <button onClick={reset} className="ml-auto rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-50" title="Cancel">
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
      <input
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Duration (e.g. 15:00)"
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleCreate}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {saving ? "Creating..." : "Create Lesson"}
        </button>
        <button onClick={reset} className="rounded-full border border-border px-4 py-1.5 text-xs font-bold text-muted transition-colors hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function AddModuleForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createModule(courseId, title.trim());
      setTitle("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create module");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-white/60 px-6 py-4 text-sm font-bold text-primary transition-colors hover:bg-soft-blue/30"
      >
        <Plus className="h-4 w-4" />
        Add Module
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-text">New Module</p>
        <button onClick={() => setOpen(false)} className="ml-auto rounded-lg p-1.5 text-muted transition-colors hover:bg-slate-50" title="Cancel">
          <X className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Module title (e.g. 1. Introduction to Maya)"
        className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={saving || !title.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {saving ? "Creating..." : "Add Module"}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted transition-colors hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z" clipRule="evenodd" />
    </svg>
  );
}