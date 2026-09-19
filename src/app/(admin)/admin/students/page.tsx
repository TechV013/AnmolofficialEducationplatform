export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Students — Admin", robots: { index: false, follow: false } };

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function AdminStudentsPage() {
  await authorizeRole("ADMIN");

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      enrollments: { select: { status: true } },
      certificates: { select: { id: true } }
    }
  });

  const activeCount = students.filter((s) => s.isActive).length;
  const activeEnrollments = students.reduce((sum, s) => sum + s.enrollments.filter((e) => e.status === "ACTIVE").length, 0);
  const totalCertificates = students.reduce((sum, s) => sum + s.certificates.length, 0);

  const summary = [
    { label: "Total Students", value: students.length, accent: "border-l-slate-400" },
    { label: "Active Accounts", value: activeCount, accent: "border-l-emerald-500" },
    { label: "Active Courses", value: activeEnrollments, accent: "border-l-blue-500" },
    { label: "Certificates", value: totalCertificates, accent: "border-l-amber-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500">Overview of all student accounts</p>
        </div>
        <Badge variant="info">{students.length} Students</Badge>
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
              <th className="px-6 py-3 text-left">Student</th>
              <th className="px-6 py-3 text-left">Active Courses</th>
              <th className="px-6 py-3 text-left">Certificates</th>
              <th className="px-6 py-3 text-left">Joined</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No students yet.</td>
              </tr>
            )}
            {students.map((s) => (
              <tr key={s.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {initials(s.name)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{s.name || "—"}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{s.enrollments.filter((e) => e.status === "ACTIVE").length}</td>
                <td className="px-6 py-4 text-slate-700">{s.certificates.length}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <Badge variant={s.isActive ? "success" : "danger"}>{s.isActive ? "Active" : "Blocked"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}