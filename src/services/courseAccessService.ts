import { prisma } from "@/lib/prisma";
import type { CourseStatus, EnrollmentStatus, UserRole } from "@prisma/client";

/**
 * Centralized, server-authoritative authorization for course *content* access.
 *
 * Rules (product requirement):
 *  - A viewer must be signed in and active.
 *  - ADMINs may view any course (including draft/archived previews).
 *  - Instructors assigned to the course may always view it (including previews).
 *  - Otherwise, only PUBLISHED courses are viewable:
 *      - FREE courses (price <= 0) are playable by any signed-in user.
 *      - PAID courses require an active (or completed) enrollment, i.e. a purchase.
 *
 * Client-supplied price/isFree/role values are never trusted; everything is
 * resolved from the database on every call.
 */

export type CourseAccessReason =
  | "ADMIN"
  | "INSTRUCTOR"
  | "ACTIVE_ENROLLMENT"
  | "FREE_PUBLISHED"
  | "UNAUTHENTICATED"
  | "USER_INACTIVE"
  | "COURSE_NOT_FOUND"
  | "NOT_PUBLISHED"
  | "PURCHASE_REQUIRED";

export interface CourseAccessDecision {
  allowed: boolean;
  reason: CourseAccessReason;
  isFree: boolean;
  isPublished: boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  hasActiveEnrollment: boolean;
  courseStatus: CourseStatus | null;
}

/** Statuses that represent a lifetime grant of access to a paid course. */
const GRANTING_ENROLLMENT_STATUSES: EnrollmentStatus[] = ["ACTIVE", "COMPLETED"];

const REASON_MESSAGES: Record<CourseAccessReason, string> = {
  ADMIN: "Access granted: administrator",
  INSTRUCTOR: "Access granted: course instructor",
  ACTIVE_ENROLLMENT: "Access granted: active enrollment",
  FREE_PUBLISHED: "Access granted: free course",
  UNAUTHENTICATED: "Unauthorized",
  USER_INACTIVE: "Forbidden: account is inactive",
  COURSE_NOT_FOUND: "Course not found",
  NOT_PUBLISHED: "Forbidden: course is not published",
  PURCHASE_REQUIRED: "Forbidden: purchase required to access this course"
};

export class CourseAccessError extends Error {
  readonly reason: CourseAccessReason;

  constructor(reason: CourseAccessReason) {
    super(REASON_MESSAGES[reason]);
    this.name = "CourseAccessError";
    this.reason = reason;
  }
}

const baseDecision = (
  reason: CourseAccessReason,
  overrides: Partial<CourseAccessDecision> = {}
): CourseAccessDecision => ({
  allowed: false,
  reason,
  isFree: false,
  isPublished: false,
  isAdmin: false,
  isInstructor: false,
  hasActiveEnrollment: false,
  courseStatus: null,
  ...overrides
});

export interface EvaluateCourseAccessInput {
  userId?: string | null;
  courseId: string;
}

/**
 * Resolve whether `userId` may view/play the content of `courseId`.
 * Pure decision function: performs no writes.
 */
export async function evaluateCourseAccess({
  userId,
  courseId
}: EvaluateCourseAccessInput): Promise<CourseAccessDecision> {
  if (!userId) return baseDecision("UNAUTHENTICATED");

  const [user, course] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, isActive: true }
    }),
    prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        price: true,
        status: true,
        instructors: { select: { userId: true } }
      }
    })
  ]);

  if (!user || !user.isActive) return baseDecision("USER_INACTIVE");
  if (!course) return baseDecision("COURSE_NOT_FOUND");

  const isFree = Number(course.price) <= 0;
  const isPublished = course.status === "PUBLISHED";
  const isAdmin = user.role === "ADMIN";
  const isInstructor = course.instructors.some((i) => i.userId === userId);

  const context = {
    isFree,
    isPublished,
    isAdmin,
    isInstructor,
    courseStatus: course.status
  } as const;

  // Admins and assigned instructors always see their course (draft previews included).
  if (isAdmin) return { ...baseDecision("ADMIN"), ...context, allowed: true };
  if (isInstructor) return { ...baseDecision("INSTRUCTOR"), ...context, allowed: true };

  // Non-owners can only reach published content.
  if (!isPublished) return { ...baseDecision("NOT_PUBLISHED"), ...context };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { status: true }
  });
  const hasActiveEnrollment =
    !!enrollment && GRANTING_ENROLLMENT_STATUSES.includes(enrollment.status);

  if (hasActiveEnrollment) {
    return { ...baseDecision("ACTIVE_ENROLLMENT"), ...context, hasActiveEnrollment: true, allowed: true };
  }

  // Free, published courses are playable by any signed-in user (login required).
  if (isFree) return { ...baseDecision("FREE_PUBLISHED"), ...context, allowed: true };

  // Paid, published course without a purchase.
  return { ...baseDecision("PURCHASE_REQUIRED"), ...context };
}

/** Convenience boolean wrapper around {@link evaluateCourseAccess}. */
export async function canAccessCourseContent(
  userId: string | null | undefined,
  courseId: string
): Promise<boolean> {
  const decision = await evaluateCourseAccess({ userId, courseId });
  return decision.allowed;
}

/**
 * Server-action guard: throws a {@link CourseAccessError} with a safe,
 * user-facing message when access is denied.
 */
export async function assertCourseContentAccess(
  userId: string | null | undefined,
  courseId: string
): Promise<CourseAccessDecision> {
  const decision = await evaluateCourseAccess({ userId, courseId });
  if (!decision.allowed) throw new CourseAccessError(decision.reason);
  return decision;
}

/** Type guard used by callers that catch errors from {@link assertCourseContentAccess}. */
export const isCourseAccessError = (error: unknown): error is CourseAccessError =>
  error instanceof CourseAccessError;

/** Re-export for callers that want to reason about the resolved viewer role. */
export type CourseViewerRole = UserRole;
