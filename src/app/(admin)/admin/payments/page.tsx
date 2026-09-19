export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Payments — Admin", robots: { index: false, follow: false } };

const statusColor: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-blue-100 text-blue-700",
};

export default async function AdminPaymentsPage() {
  await authorizeRole("ADMIN");

  const payments = await prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    include: {
      order: {
        include: {
          course: { select: { title: true } },
          user: { select: { name: true, email: true } }
        }
      }
    }
  });

  const totalPaid = payments
    .filter(p => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const summary = [
    { label: "Total", value: payments.length },
    { label: "Paid", value: payments.filter(p => p.status === "PAID").length },
    { label: "Pending", value: payments.filter(p => p.status === "PENDING").length },
    { label: "Failed", value: payments.filter(p => p.status === "FAILED").length },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold text-slate-800">Payments</h1>
        <span className="text-sm text-slate-500">Collected: <span className="font-semibold text-slate-800">INR {totalPaid.toFixed(2)}</span></span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summary.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 text-xs font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Provider</th>
              <th className="px-6 py-3 text-left">Paid At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No payments yet.</td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{p.order.user.name || "—"}</p>
                  <p className="text-xs text-slate-500">{p.order.user.email}</p>
                </td>
                <td className="px-6 py-4 text-slate-700">{p.order.course.title}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">
                  INR {Number(p.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[p.status] || "bg-slate-100 text-slate-600"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {p.provider}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}