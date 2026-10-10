export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  durationMinutes: number;
  totalLessons: number;
  rating: number;
  reviewsCount: number;
  students: number;
  price: number;
  priceOld?: number;
  isFree: boolean;
  thumbnail: string;
  instructorId?: string;
  instructorName?: string;
  whatYouWillLearn: string[];
  requirements: string[];
  promoVideoUrl?: string;
  modules: Module[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

/**
 * Lightweight shape for course list surfaces (home, /courses, related).
 * Deliberately excludes modules/description/learnings so Next.js does not
 * serialize lesson bodies, video URLs, and resources into the page payload.
 */
export type CourseSummary = Omit<
  Course,
  "modules" | "description" | "whatYouWillLearn" | "requirements" | "promoVideoUrl" | "status"
>;

export interface Instructor {
  id: string;
  name: string;
  role: string;
  description: string;
  photo: string;
}

export interface Resource {
  id: string;
  title: string;
  type: "pdf" | "link" | "file";
  url: string;
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string;
  dueDate: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: string;
  type: "video" | "assignment" | "resource";
  resources: Resource[];
  assignment?: Assignment;
  position: number;
}

export interface LessonProgress {
  position: number;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  position: number;
}

import { UserRole as PrismaUserRole } from '@prisma/client';

export type UserRole = PrismaUserRole;

export interface Testimonial {
  id?: string;
  name: string;
  role: string;
  rating: number;
  quote: string;
  category?: string;
  videoUrl?: string;
  thumbnail?: string;
  courseTaken?: string;
}