import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import type { AuthUser } from "@/types/auth";
import { prisma } from "@/lib/prisma";

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

  // Authoritative check against database
  const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
  });

  if (!dbUser || dbUser.role !== role) {
    throw new Error("Forbidden");
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