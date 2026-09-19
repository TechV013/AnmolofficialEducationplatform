import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect, notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function authorizeRole(requiredRole: UserRole) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Authoritative DB check so blocked/demoted users lose access immediately,
  // even if their JWT session is still valid.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, isActive: true },
  });

  if (!dbUser || !dbUser.isActive || dbUser.role !== requiredRole) {
    notFound();
  }
  return user;
}
