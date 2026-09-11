import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import AdminShell from "@/components/admin/AdminShell";

export default async function SubmissionsPage() {
    await authorizeRole("ADMIN");
    const submissions = await prisma.assignmentSubmission.findMany({ 
        include: { assignment: { include: { lesson: { include: { module: { include: { course: true } } } } } }, user: { select: { name: true } } } 
    });

    return (
        <AdminShell>
            <h1 className="text-3xl font-bold mb-8">Assignment Submissions</h1>
            {submissions.map(s => (
                <div key={s.id} className="p-6 bg-surface rounded-2xl border border-border mb-4">
                    <p className="font-bold text-text">{s.user.name}</p>
                    <p className="text-muted text-sm">{s.assignment.lesson.title} - {s.assignment.lesson.module.course.title}</p>
                    <p className="mt-2 text-primary text-xs font-bold">{s.status} | Submitted: {s.submittedAt.toLocaleDateString()}</p>
                </div>
            ))}
        </AdminShell>
    );
}
