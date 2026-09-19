export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import { Users, BookOpen, GraduationCap, ShoppingBag, CreditCard, ArrowUpRight, Plus, UserCog, ListOrdered, Award, UserRound, FolderOpen } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const STAT_CARDS = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "bg-blue-50 text-blue-600", bar: "border-l-blue-500" },
  { key: "publishedCourses", label: "Published Courses", icon: BookOpen, color: "bg-emerald-50 text-emerald-600", bar: "border-l-emerald-500" },
  { key: "totalEnrollments", label: "Total Enrollments", icon: GraduationCap, color: "bg-amber-50 text-amber-600", bar: "border-l-amber-500" },
  { key: "totalOrders", label: "Total Orders", icon: ShoppingBag, color: "bg-purple-50 text-purple-600", bar: "border-l-purple-500" },
  { key: "totalPayments", label: "Successful Payments", icon: CreditCard, color: "bg-rose-50 text-rose-600", bar: "border-l-rose-500" },
];

interface ActivityItem {
  type: "ENROLLMENT" | "ORDER" | "COURSE";
  title: string;
  detail: string;
  when: Date;
  href: string;
  icon: typeof UserRound;
  color: string;
}

export default async function AdminDashboardPage() {
  const user = await authorizeRole("ADMIN");

  const [totalUsers, publishedCourses, totalEnrollments, totalOrders, totalPayments, recentEnrollments, recentOrders, recentCourses] =
    await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { status: "PUBLISHED" } }),
      prisma.enrollment.count(),
      prisma.order.count(),
      prisma.payment.count({ where: { status: "PAID" } }),
      prisma.enrollment.findMany({
        take: 6,
        orderBy: { enrolledAt: "desc" },
        include: { course: { select: { title: true } }, user: { select: { name: true, email: true } } }
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { course: { select: { title: true } }, user: { select: { name: true, email: true } } }
      }),
      prisma.course.findMany({
        take: 4,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true }
      })
    ]);

  const stats = {
    totalUsers,
    publishedCourses,
    totalEnrollments,
    totalOrders,
    totalPayments,
  };

  const activity: ActivityItem[] = [
    ...recentEnrollments.map((e) => ({
      type: "ENROLLMENT" as const,
      title: `${e.user.name || e.user.email} enrolled`,
      detail: e.course.title,
      when: e.enrolledAt,
      href: "/admin/enrollments",
      icon: UserRound,
      color: "bg-amber-50 text-amber-600",
    })),
    ...recentOrders.map((o) => ({
      type: "ORDER" as const,
      title: `New order by ${o.user.name || o.user.email}`,
      detail: `${o.course.title} · ${o.currency} ${Number(o.amount).toFixed(2)}`,
      when: o.createdAt,
      href: "/admin/orders",
      icon: CreditCard,
      color: "bg-purple-50 text-purple-600",
    })),
    ...recentCourses.map((c) => ({
      type: "COURSE" as const,
      title: `Course created: ${c.title}`,
      detail: "Draft saved to the catalog",
      when: c.createdAt,
      href: "/admin/courses",
      icon: BookOpen,
      color: "bg-emerald-50 text-emerald-600",
    })),
  ].sort((a, b) => b.when.getTime() - a.when.getTime()).slice(0, 8);

  const quickActions = [
    { href: "/admin/courses", label: "New Course", description: "Add to catalog", icon: Plus, color: "bg-primary/10 text-primary" },
    { href: "/admin/users", label: "Manage Users", description: "Roles & access", icon: UserCog, color: "bg-blue-50 text-blue-600" },
    { href: "/admin/enrollments", label: "Enrollments", description: "Review activity", icon: ListOrdered, color: "bg-amber-50 text-amber-600" },
    { href: "/admin/certificates", label: "Certificates", description: "See issuances", icon: Award, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-soft-blue/60 to-white p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Admin Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Welcome back, {user.name || "Admin"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-600">
            Here is what is happening across the platform today — users, enrollments, orders and more.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAT_CARDS.map((card) => (
          <div key={card.key} className={`rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${card.bar} border-l-4`}>
            <div className={`mb-3 inline-flex rounded-lg p-2.5 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats[card.key as keyof typeof stats]}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
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

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
          </div>
          <div className="rounded-2xl border border-border bg-white shadow-sm">
            {activity.length === 0 ? (
              <div className="p-6">
                <EmptyState icon={<FolderOpen className="h-8 w-8 text-slate-300" />}>
                  <p className="text-sm text-slate-400">Activity will appear here as users engage.</p>
                </EmptyState>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activity.map((item, idx) => (
                  <li key={`${item.type}-${idx}`}>
                    <Link href={item.href} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50">
                      <span className={`mt-0.5 inline-flex rounded-full p-2 ${item.color}`}>
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-800">{item.title}</span>
                        <span className="block truncate text-xs text-slate-500">{item.detail}</span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">{new Date(item.when).toLocaleDateString()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}