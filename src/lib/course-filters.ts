import type { Course } from "@/types/lms";

export type CourseTab = "all" | "inprogress" | "completed";
export type CourseProgress = "IN_PROGRESS" | "COMPLETED";
export type DurationPresetId = "u3" | "3-6" | "6-12" | "12+";

export interface DurationPreset {
  id: DurationPresetId;
  label: string;
  minMinutes: number;
  maxMinutes?: number;
}

export const DURATION_PRESETS: DurationPreset[] = [
  { id: "u3", label: "Under 3 hrs", minMinutes: 0, maxMinutes: 180 },
  { id: "3-6", label: "3–6 hrs", minMinutes: 180, maxMinutes: 360 },
  { id: "6-12", label: "6–12 hrs", minMinutes: 360, maxMinutes: 720 },
  { id: "12+", label: "12+ hrs", minMinutes: 720 }
];

export interface CourseFiltersState {
  tab: CourseTab;
  category: string | null;
  freeOnly: boolean;
  duration: DurationPresetId | null;
}

export const DEFAULT_FILTERS: CourseFiltersState = {
  tab: "all",
  category: null,
  freeOnly: false,
  duration: null
};

export const parseFilters = (raw: {
  tab?: string;
  category?: string;
  free?: string;
  duration?: string;
}): CourseFiltersState => {
  const tab: CourseTab = raw.tab === "inprogress" || raw.tab === "completed" ? raw.tab : "all";
  const duration = DURATION_PRESETS.find((p) => p.id === raw.duration);
  return {
    tab,
    category: raw.category || null,
    freeOnly: raw.free === "1",
    duration: duration?.id ?? null
  };
};

export const getCategories = (courses: Course[]): string[] =>
  Array.from(new Set(courses.map((c) => c.category).filter((c): c is string => Boolean(c)))).sort();

export const filterCourses = (
  courses: Course[],
  filters: CourseFiltersState,
  progressByCourse: Map<string, CourseProgress> | null
): Course[] =>
  courses.filter((course) => {
    if (filters.tab !== "all") {
      if (!progressByCourse) return false;
      const target: CourseProgress = filters.tab === "inprogress" ? "IN_PROGRESS" : "COMPLETED";
      if (progressByCourse.get(course.id) !== target) return false;
    }
    if (filters.category && course.category !== filters.category) return false;
    if (filters.freeOnly && !course.isFree) return false;
    if (filters.duration) {
      const preset = DURATION_PRESETS.find((p) => p.id === filters.duration);
      if (!preset) return false;
      const minutes = course.durationMinutes;
      if (minutes < preset.minMinutes) return false;
      if (preset.maxMinutes != null && minutes >= preset.maxMinutes) return false;
    }
    return true;
  });