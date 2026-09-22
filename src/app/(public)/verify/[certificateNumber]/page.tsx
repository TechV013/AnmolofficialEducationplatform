import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CertificateVerificationPage({ params }: { params: Promise<{ certificateNumber: string }> }) {
  const { certificateNumber } = await params;
  const cert = await prisma.certificate.findUnique({
    where: { certificateNumber },
    include: { course: true, user: { select: { name: true } } }
  });

  if (!cert) return <div className="px-4 py-12 text-center text-muted">Invalid or not found certificate.</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto p-6 sm:p-12 bg-white rounded-xl shadow border">
        <h1 className="text-2xl font-bold mb-6">Certificate Verification</h1>
        <div className="space-y-4 text-sm text-text">
          <p><strong>Certificate Number:</strong> {cert.certificateNumber}</p>
          <p><strong>Student Name:</strong> {cert.user.name}</p>
          <p><strong>Course:</strong> {cert.course.title}</p>
          <p><strong>Issued At:</strong> {cert.issuedAt.toDateString()}</p>
        </div>
      </div>
    </div>
  );
}
