import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import AdminShell from "@/components/admin/AdminShell";

export default async function PaymentsPage() {
    await authorizeRole("ADMIN");
    const payments = await prisma.payment.findMany({ include: { order: { include: { course: true, user: { select: { name: true } } } } } });

    return (
        <AdminShell>
            <h1 className="text-3xl font-bold mb-8">Operational Payments</h1>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
             <table className="w-full">
                <thead className="bg-soft-blue"><tr className="text-text">
                    <th className="p-4 text-left border-b">ID</th>
                    <th className="p-4 text-left border-b">Course</th>
                    <th className="p-4 text-left border-b">Student</th>
                    <th className="p-4 text-left border-b">Amount</th>
                    <th className="p-4 text-left border-b">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-border">{payments.map(p => (
                    <tr key={p.id}>
                        <td className="p-4">{p.providerPaymentId}</td>
                        <td className="p-4">{p.order.course.title}</td>
                        <td className="p-4">{p.order.user.name}</td>
                        <td className="p-4">{p.amount.toString()}</td>
                        <td className="p-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-soft-blue text-primary">{p.status}</span></td>
                    </tr>
                ))}</tbody>
            </table>
            </div>
        </AdminShell>
    );
}