import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export default async function QuizAttemptsPage() {
    await authorizeRole("ADMIN");
    const attempts = await prisma.quizAttempt.findMany({ 
        include: { user: { select: { name: true } }, quiz: { include: { lesson: { include: { module: { include: { course: true } } } } } } } 
    });

    return (
        <div className="p-12">
            <h1 className="text-3xl font-bold mb-8">Quiz Attempts</h1>
            <table className="w-full border">
                <thead><tr className="bg-gray-100">
                    <th className="p-2 border">Student</th>
                    <th className="p-2 border">Course</th>
                    <th className="p-2 border">Score</th>
                    <th className="p-2 border">Passed</th>
                </tr></thead>
                <tbody>{attempts.map(a => (
                    <tr key={a.id}>
                        <td className="p-2 border">{a.user.name}</td>
                        <td className="p-2 border">{a.quiz.lesson.module.course.title}</td>
                        <td className="p-2 border">{a.score}</td>
                        <td className="p-2 border">{a.passed ? "Yes" : "No"}</td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
}
