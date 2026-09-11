import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/helpers";
import { notFound, redirect } from "next/navigation";

export default async function PrivateCertificatePage({ params }: { params: { certificateId: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cert = await prisma.certificate.findUnique({
    where: { id: params.certificateId },
    include: { course: true, user: { select: { name: true } } }
  });

  if (!cert || cert.userId !== user.id) notFound();

  return (
    <div className="p-12 max-w-2xl mx-auto bg-white rounded-xl shadow border">
        <h1 className="text-2xl font-bold mb-4">Your Certificate</h1>
        <p><strong>Certificate Number:</strong> {cert.certificateNumber}</p>
        <p><strong>Student Name:</strong> {cert.user.name}</p>
        <p><strong>Course:</strong> {cert.course.title}</p>
        <p><strong>Issued At:</strong> {cert.issuedAt.toDateString()}</p>
        {/* Placeholder for PDF Download */}
    </div>
  );
}
