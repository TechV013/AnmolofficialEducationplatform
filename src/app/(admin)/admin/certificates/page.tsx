export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Badge from "@/components/ui/Badge";
import { Award } from "lucide-react";

export const metadata: Metadata = { title: "Certificates — Admin", robots: { index: false, follow: false } };

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function AdminCertificatesPage() {
  await authorizeRole("ADMIN");

  const certificates = await prisma.certificate.findMany({
    orderBy: { issuedAt: "desc" },
    include: {
      course: { select: { title: true } },
      user: { select: { name: true, email: true } }
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Certificates</h1>
          <p className="text-sm text-slate-500">Completion certificates issued to students</p>
        </div>
        <Badge variant="warning">{certificates.length} Issued</Badge>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Certificate</th>
              <th className="px-6 py-3 text-left">User</th>
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Issued</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {certificates.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">No certificates issued yet.</td>
              </tr>
            )}
            {certificates.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-amber-600">
                    <Award className="h-4 w-4" />
                    {c.certificateNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                      {initials(c.user.name)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{c.user.name || "—"}</p>
                      <p className="text-xs text-slate-500">{c.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{c.course.title}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(c.issuedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}