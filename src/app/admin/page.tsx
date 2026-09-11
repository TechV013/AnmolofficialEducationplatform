import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";

export default async function AdminDashboardPage() {
  await authorizeRole("ADMIN");

  const [totalUsers, publishedCourses, totalEnrollments, totalOrders, totalPayments] = await Promise.all([
    prisma.user.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count(),
    prisma.order.count(),
    prisma.payment.count({ where: { status: "PAID" } })
  ]);

  return (
    <div className="p-12">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-xl border shadow-sm">
                <h3 className="font-semibold text-gray-500">Total Users</h3>
                <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <div className="p-6 bg-white rounded-xl border shadow-sm">
                <h3 className="font-semibold text-gray-500">Published Courses</h3>
                <p className="text-3xl font-bold">{publishedCourses}</p>
            </div>
            <div className="p-6 bg-white rounded-xl border shadow-sm">
                <h3 className="font-semibold text-gray-500">Total Enrollments</h3>
                <p className="text-3xl font-bold">{totalEnrollments}</p>
            </div>
            <div className="p-6 bg-white rounded-xl border shadow-sm">
                <h3 className="font-semibold text-gray-500">Total Orders</h3>
                <p className="text-3xl font-bold">{totalOrders}</p>
            </div>
            <div className="p-6 bg-white rounded-xl border shadow-sm">
                <h3 className="font-semibold text-gray-500">Successful Payments</h3>
                <p className="text-3xl font-bold">{totalPayments}</p>
            </div>
        </div>
    </div>
  );
}
