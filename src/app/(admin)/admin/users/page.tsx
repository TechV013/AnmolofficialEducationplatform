export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { UserActionForm, DeleteUserForm, BlockUserForm } from "@/components/admin/UserActionForm";

export default async function Page() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <span className="text-sm text-slate-500">{users.length} Users</span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 text-xs font-semibold">
            <tr>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
            {users.map(user => (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${!user.isActive ? "bg-red-50/60" : ""}`}>
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {user.role}
                    </span>
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                        <UserActionForm userId={user.id} currentRole={user.role} />
                        {user.role !== 'ADMIN' && <BlockUserForm userId={user.id} isActive={user.isActive} />}
                        <DeleteUserForm userId={user.id} />
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}