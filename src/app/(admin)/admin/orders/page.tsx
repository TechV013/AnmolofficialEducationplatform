export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Orders — Admin", robots: { index: false, follow: false } };

const statusColor: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default async function AdminOrdersPage() {
  await authorizeRole("ADMIN");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { title: true } },
      user: { select: { name: true, email: true } }
    }
  });

  const summary = [
    { label: "Total", value: orders.length },
    { label: "Paid", value: orders.filter(o => o.status === "PAID").length },
    { label: "Pending", value: orders.filter(o => o.status === "PENDING").length },
    { label: "Failed", value: orders.filter(o => o.status === "FAILED").length },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Orders</h1>

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
              <th className="px-6 py-3 text-left">Order</th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No orders yet.</td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{o.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{o.user.name || "—"}</p>
                  <p className="text-xs text-slate-500">{o.user.email}</p>
                </td>
                <td className="px-6 py-4 text-slate-700">{o.course.title}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">
                  {o.currency} {Number(o.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[o.status] || "bg-slate-100 text-slate-600"}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}