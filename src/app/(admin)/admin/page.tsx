export const dynamic = "force-dynamic";
import type { Metadata } from "next";                
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import { Users, BookOpen, GraduationCap, ShoppingBag, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  await authorizeRole("ADMIN");

  const [totalUsers, publishedCourses, totalEnrollments, totalOrders, totalPayments] = await Promise.all([
    prisma.user.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count(),
    prisma.order.count(),
    prisma.payment.count({ where: { status: "PAID" } })
  ]);

  const stats = [
    { title: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600" },
    { title: "Published Courses", value: publishedCourses, icon: BookOpen, color: "text-emerald-600" },
    { title: "Total Enrollments", value: totalEnrollments, icon: GraduationCap, color: "text-amber-600" },
    { title: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-purple-600" },
    { title: "Successful Payments", value: totalPayments, icon: CreditCard, color: "text-rose-600" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-100 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}