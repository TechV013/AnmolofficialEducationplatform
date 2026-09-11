import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export default async function CertificatesPage() {
    await authorizeRole("ADMIN");
    const certs = await prisma.certificate.findMany({ include: { user: { select: { name: true } }, course: { select: { title: true } } } });

    return (
        <div className="p-12">
            <h1 className="text-3xl font-bold mb-8">Certificates</h1>
            {certs.map(c => (
                <div key={c.id} className="p-4 border mb-2">
                    <p><strong>{c.certificateNumber}</strong> - {c.user.name} for {c.course.title}</p>
                </div>
            ))}
        </div>
    );
}
