import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function CertificateVerificationPage({ params }: { params: { certificateNumber: string } }) {
  const cert = await prisma.certificate.findUnique({
    where: { certificateNumber: params.certificateNumber },
    include: { course: true, user: { select: { name: true } } }
  });

  if (!cert) return <div className="p-12 text-center">Invalid or not found certificate.</div>;

  return (
    <div className="p-12 max-w-2xl mx-auto bg-white rounded-xl shadow border">
        <h1 className="text-2xl font-bold mb-4">Certificate Verification</h1>
        <p><strong>Certificate Number:</strong> {cert.certificateNumber}</p>
        <p><strong>Student Name:</strong> {cert.user.name}</p>
        <p><strong>Course:</strong> {cert.course.title}</p>
        <p><strong>Issued At:</strong> {cert.issuedAt.toDateString()}</p>
    </div>
  );
}
