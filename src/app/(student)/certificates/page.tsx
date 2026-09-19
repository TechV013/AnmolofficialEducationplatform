import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };

import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const certificates = await prisma.certificate.findMany({
    where: { userId: user.id },
    orderBy: { issuedAt: "desc" },
    include: { course: { select: { id: true, title: true, thumbnail: true } } }
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">My Certificates</h1>
      <p className="text-muted mb-8">Certificates are issued automatically when you complete 100% of a course.</p>

      {certificates.length === 0 ? (
        <div className="bg-surface p-12 rounded-3xl border border-border text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-soft-blue flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <p className="font-bold text-text mb-2">No certificates yet</p>
          <p className="text-muted text-sm mb-6">Complete a course to earn your first certificate.</p>
          <Link href="/courses" className="inline-block bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-colors">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border bg-gradient-to-br from-soft-blue to-surface">
                <p className="text-2xl mb-1">🎓</p>
                <h2 className="font-bold text-text">{cert.course.title}</h2>
                <p className="text-xs text-muted mt-1">Certificate #{cert.certificateNumber}</p>
              </div>
              <div className="p-5 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-xs text-muted">Issued</p>
                  <p className="text-sm font-semibold">{cert.issuedAt.toLocaleDateString()}</p>
                </div>
                <Link
                  href={`/certificate/${cert.id}`}
                  className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors"
                >
                  View Certificate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}