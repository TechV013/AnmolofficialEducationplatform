import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export default async function SubmissionsPage() {
    await authorizeRole("ADMIN");
    const submissions = await prisma.assignmentSubmission.findMany({ 
        include: { assignment: { include: { lesson: { include: { module: { include: { course: true } } } } } }, user: { select: { name: true } } } 
    });

    return (
        <div className="p-12">
            <h1 className="text-3xl font-bold mb-8">Assignment Submissions</h1>
            {submissions.map(s => (
                <div key={s.id} className="p-4 border mb-2">
                    <p><strong>{s.user.name}</strong> - {s.assignment.title} ({s.assignment.lesson.module.course.title})</p>
                    <p>Status: {s.status} | Submitted: {s.createdAt.toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}
