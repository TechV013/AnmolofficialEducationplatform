export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/helpers";
import { updateUserRole, deleteUser } from "./actions";

export default async function Page() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Name</th>
            <th className="text-left py-2">Email</th>
            <th className="text-left py-2">Role</th>
            <th className="text-left py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="py-2">{user.name}</td>
              <td className="py-2">{user.email}</td>
              <td className="py-2">{user.role}</td>
              <td className="py-2 flex gap-2">
                <form action={async (formData) => {
                  "use server";
                  await updateUserRole(user.id, formData.get("role") as any);
                }} className="flex gap-2">
                  <select name="role" defaultValue={user.role} className="border rounded px-2 py-1">
                    <option value="STUDENT">STUDENT</option>
                    <option value="INSTRUCTOR">INSTRUCTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button className="bg-primary text-white px-3 py-1 rounded text-sm">Update</button>
                </form>
                <form action={async () => {
                    "use server";
                    await deleteUser(user.id);
                }}>
                    <button className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}