import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { NextResponse } from "next/server";
import type { AuthUser } from "@/lib/auth/types";

export async function getSession() {
  const session = await getServerSession(authConfig);
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return (session?.user as AuthUser | null) || null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export async function requireRole(role: string) {
  const user = await requireUser();
  if (user && user.role !== role) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return user;
}

export async function requireStudent() {
  return requireRole("STUDENT");
}

export async function requireInstructor() {
  return requireRole("INSTRUCTOR");
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}
