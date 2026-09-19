export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export const metadata: Metadata = { title: "Students — Instructor", robots: { index: false, follow: false } };

export default async function InstructorStudentsPage() {
  const user = await authorizeRole("INSTRUCTOR");

  const courses = await prisma.course.findMany({
    where: { instructors: { some: { userId: user.id } } },
    orderBy: { title: "asc" },
    include: {
      modules: { select: { lessons: { select: { id: true } } } },
      enrollments: {
        where: { status: "ACTIVE" },
        orderBy: { enrolledAt: "asc" },
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  const allLessonIds = courses.flatMap(c => c.modules.flatMap(m => m.lessons.map(l => l.id)));

  const completedProgress = allLessonIds.length > 0
    ? await prisma.lessonProgress.findMany({
        where: { lessonId: { in: allLessonIds }, completed: true },
        select: { userId: true, lessonId: true }
      })
    : [];

  const completedMap = new Map<string, Set<string>>();
  for (const p of completedProgress) {
    if (!completedMap.has(p.userId)) completedMap.set(p.userId, new Set());
    completedMap.get(p.userId)!.add(p.lessonId);
  }

  let studentTotal = 0;
  courses.forEach(c => { studentTotal += c.enrollments.length; });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Students</h1>
          <p className="text-sm text-slate-500 mt-1">Students enrolled in your courses with progress.</p>
        </div>
        <span className="text-sm text-slate-500">{studentTotal} Enrollments</span>
      </div>

      {courses.length === 0 && (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-500">
          You have no assigned courses yet.
        </div>
      )}

      {courses.map(course => {
        const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
        return (
          <section key={course.id} className="mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center justify-between">
              {course.title}
              <span className="text-sm font-normal text-slate-500">{course.enrollments.length} students · {lessonCount} lessons</span>
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              {course.enrollments.length === 0 ? (
                <p className="p-6 text-sm text-slate-400 text-center">No enrolled students yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 text-xs font-semibold">
                    <tr>
                      <th className="px-6 py-3 text-left">Student</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Enrolled</th>
                      <th className="px-6 py-3 text-left">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {course.enrollments.map(enr => {
                      const done = completedMap.get(enr.userId)?.size ?? 0;
                      const pct = lessonCount > 0 ? Math.round((done / lessonCount) * 100) : 0;
                      return (
                        <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{enr.user.name || "—"}</td>
                          <td className="px-6 py-4 text-slate-600">{enr.user.email}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(enr.enrolledAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-slate-500">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}