import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import type { AuthUser } from "@/types/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await getServerSession(authConfig);
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return (session?.user as AuthUser | null) || null;
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(role: string): Promise<AuthUser> {
  const user = await requireUser();
  
  if (!user.id) {
      throw new Error("Unauthorized: Missing user ID");
  }

  // Authoritative check against database
  const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, isActive: true }
  });

  if (!dbUser) {
      throw new Error("Forbidden: User not found in database");
  }

  if (!dbUser.isActive) {
    throw new Error("Forbidden: Account deactivated");
  }
  
  if (dbUser.role !== role) {
    throw new Error("Forbidden: Role mismatch");
  }
  return user;
}

export async function requireStudent(): Promise<AuthUser> {
  return requireRole("STUDENT");
}

export async function requireInstructor(): Promise<AuthUser> {
  return requireRole("INSTRUCTOR");
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole("ADMIN");
}

/**
 * Safe version of requireInstructor that redirects to login instead of throwing.
 * Use in layouts to prevent the error boundary from catching session changes.
 */
export async function requireInstructorOrRedirect(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || !user.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true }
  });

  if (!dbUser || !dbUser.isActive) redirect("/login?reason=account_inactive");
  if (dbUser.role !== "INSTRUCTOR") redirect("/login?reason=session_changed");

  return { ...user, role: dbUser.role } as AuthUser;
}

/**
 * Safe version of requireStudent that redirects to login instead of throwing.
 * Use in layouts to prevent the error boundary from catching session changes.
 */
export async function requireStudentOrRedirect(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || !user.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true }
  });

  if (!dbUser || !dbUser.isActive) redirect("/login?reason=account_inactive");
  if (dbUser.role !== "STUDENT") redirect("/login?reason=session_changed");

  return { ...user, role: dbUser.role } as AuthUser;
}

/**
 * Safe version of requireAdmin that redirects to login instead of throwing.
 * Use in layouts to prevent the error boundary from catching session changes.
 */
export async function requireAdminOrRedirect(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || !user.id) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true }
  });

  if (!dbUser || !dbUser.isActive) redirect("/login?reason=account_inactive");
  if (dbUser.role !== "ADMIN") redirect("/login?reason=session_changed");

  return { ...user, role: dbUser.role } as AuthUser;
}