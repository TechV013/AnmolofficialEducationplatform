export type LessonKind =
  | "quiz"
  | "assignment"
  | "resource"
  | "video"
  | "text";

export interface LessonKindInput {
  videoUrl?: string | null;
  quiz?: unknown | null;
  assignment?: unknown | null;
  resources?: unknown[] | null;
}

export function deriveLessonKind(lesson: LessonKindInput): LessonKind {
  if (lesson.quiz) return "quiz";
  if (lesson.assignment) return "assignment";
  if (lesson.resources && lesson.resources.length > 0) return "resource";
  if (lesson.videoUrl) return "video";
  return "text";
}

export const LESSON_KIND_META: Record<LessonKind, { label: string; icon: string; badge: string }> = {
  quiz: { label: "Quiz", icon: "🧠", badge: "bg-violet-100 text-violet-700" },
  assignment: { label: "Assignment", icon: "📝", badge: "bg-amber-100 text-amber-700" },
  resource: { label: "Resource", icon: "📄", badge: "bg-sky-100 text-sky-700" },
  video: { label: "Video", icon: "🎥", badge: "bg-soft-blue text-primary" },
  text: { label: "Text", icon: "📖", badge: "bg-slate-100 text-slate-600" }
};

export function padNumber(n: number): string {
  return String(n).padStart(2, "0");
}

export interface Orderable {
  id: string;
  position: number;
}

export interface SwapPlan {
  current: Orderable;
  target: Orderable;
  /** A position guaranteed to be free (above every existing row). */
  sentinel: number;
}

/**
 * Deterministic neighbour swap planning for persisted `position` fields.
 * `items` must already be sorted ascending by position.
 * Returns null at boundaries (first item up, last item down) and when the id
 * is not part of the list, so callers must verify membership separately.
 */
export function findSwapTarget(items: Orderable[], id: string, direction: -1 | 1): SwapPlan | null {
  if (items.length < 2) return null;
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return null;
  return {
    current: items[index],
    target: items[targetIndex],
    sentinel: items.reduce((max, item) => Math.max(max, item.position), -1) + 1
  };
}

export function parseDurationToSeconds(duration: string): number | null {
  const trimmed = duration.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => !Number.isFinite(p) || p < 0)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

export function formatSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}`;
  if (minutes > 0) return `${minutes}:${String(seconds).padStart(2, "0")}`;
  return `${seconds}s`;
}

export function sumDurations(durations: string[]): string | null {
  let total = 0;
  for (const d of durations) {
    const seconds = parseDurationToSeconds(d);
    if (seconds == null) continue;
    total += seconds;
  }
  return total > 0 ? formatSeconds(total) : null;
}