export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import CourseActions from "@/components/admin/CourseActions";
import Badge from "@/components/ui/Badge";
import { Search, Filter, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Courses — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminCoursesPage() {
  await authorizeRole("ADMIN");

  const [courses, instructors] = await Promise.all([
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        instructors: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        _count: { select: { modules: true, enrollments: true, reviews: true } }
      }
    }),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" }
    })
  ]);

  const statusCounts = {
    DRAFT: courses.filter(c => c.status === "DRAFT").length,
    PUBLISHED: courses.filter(c => c.status === "PUBLISHED").length,
    ARCHIVED: courses.filter(c => c.status === "ARCHIVED").length,
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Course Management</h1>
          <p className="text-sm text-slate-500">Manage, edit, publish, and assign courses to instructors</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">{courses.length} Courses</Badge>
          <Badge variant="success">{statusCounts.PUBLISHED} Published</Badge>
          <Badge variant="warning">{statusCounts.DRAFT} Drafts</Badge>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses by title or slug..."
            className="flex-1 border-0 focus:ring-0 text-sm outline-none"
          />
        </div>
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600">
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600">
          <option value="">All Instructors</option>
          {instructors.map(i => (
            <option key={i.id} value={i.id}>{i.name || i.email}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 text-xs font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Instructors</th>
              <th className="px-6 py-3 text-center">Modules</th>
              <th className="px-6 py-3 text-center">Students</th>
              <th className="px-6 py-3 text-center">Reviews</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-10 text-center text-slate-400">No courses yet.</td></tr>
            )}
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/admin/courses/${course.id}`} className="font-medium text-slate-900 hover:text-primary">
                    {course.title}
                  </Link>
                  <p className="text-xs text-slate-400">/{course.slug}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  ₹{Number(course.price)}
                  {course.priceOld && Number(course.priceOld) > Number(course.price) && (
                    <span className="ml-1 text-xs line-through text-slate-400">₹{Number(course.priceOld)}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {course.instructors.length === 0
                    ? <span className="text-slate-400 text-xs">Unassigned</span>
                    : course.instructors.map(i => i.user.name || i.user.email).join(", ")}
                </td>
                <td className="px-6 py-4 text-center text-slate-600">{course._count.modules}</td>
                <td className="px-6 py-4 text-center text-slate-600">{course._count.enrollments}</td>
                <td className="px-6 py-4 text-center text-slate-600">{course._count.reviews}</td>
                <td className="px-6 py-4 text-slate-500 text-xs">{new Date(course.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <CourseActions
                    courseId={course.id}
                    status={course.status}
                    instructors={instructors}
                    assigned={course.instructors}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}