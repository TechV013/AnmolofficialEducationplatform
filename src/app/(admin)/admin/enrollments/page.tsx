export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Enrollments — Admin", robots: { index: false, follow: false } };

const statusColor: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED: "bg-amber-100 text-amber-700",
};

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
    { label: "Total", value: enrollments.length },
    { label: "Active", value: counts.ACTIVE || 0 },
    { label: "Completed", value: counts.COMPLETED || 0 },
    { label: "Cancelled", value: counts.CANCELLED || 0 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Enrollments</h1>

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
              <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{e.user.name || "—"}</p>
                  <p className="text-xs text-slate-500">{e.user.email}</p>
                </td>
                <td className="px-6 py-4 text-slate-700">{e.course.title}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[e.status] || "bg-slate-100 text-slate-600"}`}>
                    {e.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{new Date(e.enrolledAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}