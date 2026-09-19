export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { ADMIN_EMAIL } from "@/lib/auth/admin";
import { RoleSwitch, BlockUserButton, DeleteUserButton } from "@/components/admin/UserActionForm";
import { Crown, Info } from "lucide-react";

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function Page() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <span className="text-sm text-slate-500">{users.length} Users</span>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 mb-6">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-slate-700">
          Only <span className="font-semibold">{ADMIN_EMAIL}</span> is the Admin. Role changes are limited to
          Student ⇄ Instructor; the Admin account is locked.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 text-xs font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No users yet.</td>
              </tr>
            )}
            {users.map((user) => {
              const isAdmin = user.role === "ADMIN" || user.email === ADMIN_EMAIL;
              return (
                <tr key={user.id} className={`transition-colors ${user.isActive ? "hover:bg-slate-50" : "bg-red-50/60"} ${!user.isActive ? "opacity-75" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {initials(user.name)}
                      </span>
                      <div>
                        <p className="font-medium text-slate-900">{user.name || "—"}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                        <Crown className="h-3.5 w-3.5" />
                        Super Admin
                      </span>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "INSTRUCTOR" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.isActive ? "Active" : "Blocked"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <span className="text-xs text-slate-400">No actions</span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <RoleSwitch userId={user.id} currentRole={user.role as "STUDENT" | "INSTRUCTOR"} />
                        <BlockUserButton userId={user.id} isActive={user.isActive} />
                        <DeleteUserButton userId={user.id} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}