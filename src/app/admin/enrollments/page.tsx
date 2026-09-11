import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import AdminShell from "@/components/admin/AdminShell";

export default async function EnrollmentPage() {
    await authorizeRole("ADMIN");
    const enrollments = await prisma.enrollment.findMany({ include: { user: { select: { name: true } }, course: { select: { title: true } } } });

    return (
        <AdminShell>
            <h1 className="text-3xl font-bold mb-8">Enrollments</h1>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
             <table className="w-full">
                <thead className="bg-soft-blue"><tr className="text-text">
                    <th className="p-4 text-left border-b">Student</th>
                    <th className="p-4 text-left border-b">Course</th>
                    <th className="p-4 text-left border-b">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-border">{enrollments.map(e => (
                    <tr key={e.id}>
                        <td className="p-4">{e.user.name}</td>
                        <td className="p-4">{e.course.title}</td>
                        <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-soft-blue text-primary">{e.status}</span></td>
                    </tr>
                ))}</tbody>
            </table>
            </div>
        </AdminShell>
    );
}
