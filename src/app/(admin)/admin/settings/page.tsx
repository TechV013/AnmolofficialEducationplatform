import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/instructor/ProfileForm";
import { notFound } from "next/navigation";

export default async function AdminSettingsPage() {
  const authUser = await requireAdmin();
  const user = await prisma.user.findUnique({
    where: { id: authUser.id }
  });

  if (!user) notFound();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">Account Settings</h1>
        <p className="text-sm text-muted">Manage your administrative profile and platform preferences.</p>
      </div>

      <ProfileForm user={user} />
      
      <div className="bg-slate-50 border border-border p-6 rounded-2xl">
        <h3 className="font-bold text-slate-800 mb-2">Platform Administration</h3>
        <p className="text-sm text-slate-500">You are currently logged in with full administrative privileges. Use the sidebar to manage users, courses, and platform data.</p>
      </div>
    </div>
  );
}
