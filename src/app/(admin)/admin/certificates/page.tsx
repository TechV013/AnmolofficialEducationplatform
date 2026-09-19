export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import { Award } from "lucide-react";

export const metadata: Metadata = { title: "Certificates — Admin", robots: { index: false, follow: false } };

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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Certificates</h1>
        <span className="text-sm text-slate-500">{certificates.length} Issued</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 text-xs font-semibold">
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
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-amber-600">
                    <Award className="h-4 w-4" />
                    {c.certificateNumber}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-slate-900">{c.user.name || "—"}</p>
                  <p className="text-xs text-slate-500">{c.user.email}</p>
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