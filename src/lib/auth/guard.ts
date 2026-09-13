import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect, notFound } from "next/navigation";
import { UserRole } from "@prisma/client";

export async function authorizeRole(requiredRole: UserRole) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== requiredRole) {
    notFound();
  }
  return user;
}
