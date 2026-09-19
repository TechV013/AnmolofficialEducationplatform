export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Orders — Admin", robots: { index: false, follow: false } };

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function statusBadge(status: string) {
  switch (status) {
    case "PAID": return <Badge variant="success">{status}</Badge>;
    case "PENDING": return <Badge variant="warning">{status}</Badge>;
    case "FAILED": return <Badge variant="danger">{status}</Badge>;
    case "REFUNDED": return <Badge variant="info">{status}</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

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
    { label: "Total Orders", value: orders.length, accent: "border-l-slate-400" },
    { label: "Paid", value: orders.filter((o) => o.status === "PAID").length, accent: "border-l-emerald-500" },
    { label: "Pending", value: orders.filter((o) => o.status === "PENDING").length, accent: "border-l-amber-500" },
    { label: "Failed", value: orders.filter((o) => o.status === "FAILED").length, accent: "border-l-red-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-sm text-slate-500">Checkout orders placed on the platform</p>
        </div>
        <Badge variant="info">{orders.length} Total</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className={`rounded-2xl border border-border border-l-4 bg-white p-5 shadow-sm ${s.accent}`}>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
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
              <tr key={o.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{o.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {initials(o.user.name)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{o.user.name || "—"}</p>
                      <p className="text-xs text-slate-500">{o.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{o.course.title}</td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {o.currency} {Number(o.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4">{statusBadge(o.status)}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}