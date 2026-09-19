export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Enrollments — Admin", robots: { index: false, follow: false } };

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
    case "ACTIVE": return <Badge variant="success">{status}</Badge>;
    case "COMPLETED": return <Badge variant="info">{status}</Badge>;
    case "CANCELLED": return <Badge variant="danger">{status}</Badge>;
    case "EXPIRED": return <Badge variant="warning">{status}</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

export default async function AdminEnrollmentsPage() {
  await authorizeRole("ADMIN");

  const enrollments = await prisma.enrollment.findMany({
    orderBy: { enrolledAt: "desc" },
    include: {
      course: { select: { title: true } },
      user: { select: { name: true, email: true } }
    }
  });

  const counts = enrollments.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {});

  const summary = [
    { label: "Total", value: enrollments.length, accent: "border-l-slate-400" },
    { label: "Active", value: counts.ACTIVE || 0, accent: "border-l-emerald-500" },
    { label: "Completed", value: counts.COMPLETED || 0, accent: "border-l-blue-500" },
    { label: "Cancelled", value: counts.CANCELLED || 0, accent: "border-l-red-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Enrollments</h1>
          <p className="text-sm text-slate-500">Every user-course registration</p>
        </div>
        <Badge variant="info">{enrollments.length} Total</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className={`rounded-2xl border border-border border-l-4 bg-white p-5 shadow-sm ${s.accent}`}>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Enrolled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">No enrollments yet.</td>
              </tr>
            )}
            {enrollments.map((e) => (
              <tr key={e.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {initials(e.user.name)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{e.user.name || "—"}</p>
                      <p className="text-xs text-slate-500">{e.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{e.course.title}</td>
                <td className="px-6 py-4">{statusBadge(e.status)}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(e.enrolledAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}