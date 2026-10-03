export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/helpers";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import { BookOpen, CheckCircle2, Award, TrendingUp } from "lucide-react";

export const metadata: Metadata = { title: "Progress", robots: { index: false, follow: false } };

export default async function ProgressPage() {
  const user = await requireStudent();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          instructors: { include: { user: { select: { name: true } } } },
          modules: { include: { lessons: { select: { id: true } } } }
        }
      }
    }
  });

  const courseIds = enrollments.map((en) => en.courseId);

  const [completedRows, lastRows, certificates] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true, lesson: { module: { courseId: { in: courseIds } } } },
      select: { lesson: { select: { module: { select: { courseId: true } } } } }
    }),
    prisma.lessonProgress.findMany({
      where: { userId: user.id, lesson: { module: { courseId: { in: courseIds } } } },
      orderBy: { lastWatchedAt: "desc" },
      select: { lessonId: true, lesson: { select: { module: { select: { courseId: true } } } } }
    }),
    prisma.certificate.count({ where: { userId: user.id } })
  ]);

  const completedByCourse = new Map<string, number>();
  for (const row of completedRows) {
    const cid = row.lesson.module.courseId;
    completedByCourse.set(cid, (completedByCourse.get(cid) ?? 0) + 1);
  }

  const lastByCourse = new Map<string, string>();
  for (const row of lastRows) {
    const cid = row.lesson.module.courseId;
    if (!lastByCourse.has(cid)) lastByCourse.set(cid, row.lessonId);
  }

  const courses = enrollments.map((en) => {
    const lessons = en.course.modules.flatMap((m) => m.lessons);
    const completed = completedByCourse.get(en.courseId) ?? 0;
    const total = lessons.length;
    return {
      id: en.courseId,
      title: en.course.title,
      instructorName: en.course.instructors[0]?.user.name || null,
      completed,
      total,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      continueLessonId: lastByCourse.get(en.courseId) ?? lessons[0]?.id ?? null
    };
  });

  const totalLessons = courses.reduce((sum, c) => sum + c.total, 0);
  const totalCompleted = completedRows.length;
  const avgProgress = courses.length
    ? Math.round(courses.reduce((sum, c) => sum + c.percent, 0) / courses.length)
    : 0;

  const summary = [
    { label: "Enrolled Courses", value: String(courses.length), icon: BookOpen, color: "bg-blue-50 text-blue-600", bar: "border-l-blue-500" },
    { label: "Average Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "bg-violet-50 text-violet-600", bar: "border-l-violet-500" },
    { label: "Lessons Completed", value: `${totalCompleted}/${totalLessons}`, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", bar: "border-l-emerald-500" },
    { label: "Certificates", value: String(certificates), icon: Award, color: "bg-amber-50 text-amber-600", bar: "border-l-amber-500" }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Progress</h1>
        <p className="text-sm text-slate-500">Course completion, lessons and achievements across your learning journey</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className={`rounded-2xl border border-border border-l-4 bg-white p-5 shadow-sm ${s.bar}`}>
            <div className={`mb-3 inline-flex rounded-lg p-2.5 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="mb-6 text-sm text-slate-500">You are not enrolled in any courses yet.</p>
          <Link href="/courses" className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-white hover:bg-primary-hover transition-colors">Browse Courses</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/classroom/${c.id}`} className="font-medium text-slate-900 hover:text-primary">
                    {c.title}
                  </Link>
                  <p className="text-xs text-slate-500">Instructor: {c.instructorName || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={c.percent === 100 ? "success" : "primary"}>{c.percent}%</Badge>
                  {c.continueLessonId && (
                    <Link
                      href={`/classroom/${c.id}/${c.continueLessonId}`}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
                    >
                      Continue
                    </Link>
                  )}
                </div>
              </div>
              <Progress value={c.percent} className="mt-4" />
              <p className="mt-2 text-xs text-slate-500">
                {c.completed} of {c.total} lessons completed
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
