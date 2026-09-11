
import { LessonProgress } from "@/types/lms";

const isBrowser = typeof window !== "undefined";

export const getStorage = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

export const setStorage = <T>(key: string, value: T): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
};

// Progress helpers
export const getLessonProgress = (courseId: string, lessonId: string): LessonProgress => {
  return getStorage(`lms_progress_${courseId}_${lessonId}`, { position: 0, completed: false });
};

export const saveLessonProgress = (courseId: string, lessonId: string, progress: LessonProgress) => {
  setStorage(`lms_progress_${courseId}_${lessonId}`, {
    position: Math.max(0, isNaN(progress.position) ? 0 : progress.position),
    completed: !!progress.completed
  });
};

// Note helpers
export const getLessonNote = (courseId: string, lessonId: string): string => {
  return getStorage(`lms_note_${courseId}_${lessonId}`, "");
};

export const saveLessonNote = (courseId: string, lessonId: string, note: string) => {
  setStorage(`lms_note_${courseId}_${lessonId}`, note);
};
