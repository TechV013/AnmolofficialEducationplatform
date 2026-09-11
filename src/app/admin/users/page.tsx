import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import AdminShell from "@/components/admin/AdminShell";

export default async function UserManagementPage() {
  await authorizeRole("ADMIN");
  
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminShell>
        <h1 className="text-3xl font-bold mb-8">User Management</h1>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
            <thead>
                <tr className="bg-soft-blue text-text">
                    <th className="p-4 text-left">Name</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">Role</th>
                    <th className="p-4 text-left">Created</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {users.map(u => (
                    <tr key={u.id}>
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.role}</td>
                        <td className="p-4">{u.createdAt.toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    </AdminShell>
  );
}
