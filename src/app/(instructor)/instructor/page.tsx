import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import { BookOpen, Users, MessageSquare, ArrowUpRight, PlusCircle, ListChecks, Star } from "lucide-react";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const STATUS_VARIANT: Record<string, "warning" | "success" | "secondary"> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "secondary",
};

export default async function InstructorDashboardPage() {
  const user = await authorizeRole("INSTRUCTOR");

  const [instructorCourses, studentCount, reviewCount] = await Promise.all([
    prisma.course.findMany({
      where: { instructors: { some: { userId: user.id } } },
      include: { modules: { include: { lessons: true } }, _count: { select: { enrollments: true, reviews: true } } }
    }),
    prisma.enrollment.count({ where: { status: "ACTIVE", course: { instructors: { some: { userId: user.id } } } } }),
    prisma.review.count({ where: { course: { instructors: { some: { userId: user.id } } } } })
  ]);

  const totalLessons = instructorCourses.reduce((sum, c) => sum + c.modules.reduce((s, m) => s + m.lessons.length, 0), 0);
  const publishedCount = instructorCourses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = instructorCourses.filter((c) => c.status === "DRAFT").length;

  const statCards = [
    { label: "Courses", value: instructorCourses.length, sub: `${totalLessons} lessons total`, icon: BookOpen, color: "bg-blue-50 text-blue-600", bar: "border-l-blue-500", href: "/instructor/courses" },
    { label: "Students", value: studentCount, sub: `${publishedCount} published · ${draftCount} drafts`, icon: Users, color: "bg-emerald-50 text-emerald-600", bar: "border-l-emerald-500", href: "/instructor/students" },
    { label: "Reviews", value: reviewCount, sub: "across your courses", icon: MessageSquare, color: "bg-amber-50 text-amber-600", bar: "border-l-amber-500", href: "/instructor/reviews" },
  ];

  const quickActions = [
    { href: "/instructor/courses", label: "Manage Courses", description: "Content & publishing", icon: ListChecks, color: "bg-primary/10 text-primary" },
    { href: "/instructor/students", label: "View Students", description: "Who is learning", icon: Users, color: "bg-emerald-50 text-emerald-600" },
    { href: "/instructor/reviews", label: "Reviews", description: "Reply & engage", icon: Star, color: "bg-amber-50 text-amber-600" },
    { href: "/instructor/profile", label: "Profile", description: "Update your details", icon: PlusCircle, color: "bg-blue-50 text-blue-600" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-soft-blue/60 to-white p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Instructor Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Welcome back, {user.name || "Instructor"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-600">
            Manage your courses, see who is learning, and keep your reviews answered.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-2xl border border-border border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${card.bar}`}
          >
            <div className={`mb-3 inline-flex rounded-lg p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">{card.label}</p>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">My Courses</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {instructorCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-400 sm:col-span-2">
                You have no courses assigned yet. Ask an admin to assign one.
              </div>
            ) : (
              instructorCourses.map((course) => (
                <div key={course.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex rounded-lg bg-blue-50 p-2 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                      </span>
                      <h3 className="font-bold text-slate-900">{course.title}</h3>
                    </div>
                    <Badge variant={STATUS_VARIANT[course.status] || "secondary"}>{course.status}</Badge>
                  </div>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-500">{course.description}</p>
                  <div className="flex gap-2">
                    <Link href={`/instructor/courses/${course.id}`} className="flex-1 rounded-full border-2 border-primary/30 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5">
                      Manage Content
                    </Link>
                    <Link href="/instructor/students" className="flex-1 rounded-full border-2 border-slate-200 py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                      {course._count.enrollments} students
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span className={`inline-flex rounded-lg p-3 ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-800">{action.label}</span>
                  <span className="block text-xs text-slate-500">{action.description}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}