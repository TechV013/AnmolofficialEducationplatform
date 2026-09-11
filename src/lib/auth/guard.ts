import { getCurrentUser } from "@/lib/auth/helpers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

export async function authorizeRole(requiredRole: UserRole) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== requiredRole) redirect("/dashboard"); // Or homepage
  return user;
}
