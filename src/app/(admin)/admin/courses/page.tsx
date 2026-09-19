export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import CourseCreateForm from "@/components/admin/CourseCreateForm";
import CourseActions from "@/components/admin/CourseActions";
import Badge from "@/components/ui/Badge";

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
        _count: { select: { modules: true, enrollments: true } }
      }
    }),
    prisma.user.findMany({
      where: { role: "INSTRUCTOR" },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Course Management</h1>
          <p className="text-sm text-slate-500">Create, publish, and assign courses to instructors</p>
        </div>
        <Badge variant="info">{courses.length} Courses</Badge>
      </div>

      <CourseCreateForm />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 text-xs font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Course</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Instructors</th>
              <th className="px-6 py-3 text-left">Modules</th>
              <th className="px-6 py-3 text-left">Students</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400">No courses yet. Create your first course above.</td></tr>
            )}
            {courses.map(course => (
              <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/admin/courses/${course.id}`} className="font-medium text-slate-900 hover:text-primary">
                    {course.title}
                  </Link>
                  <p className="text-xs text-slate-400">/{course.slug}</p>
                </td>
                <td className="px-6 py-4 text-slate-600">₹{Number(course.price)}</td>
                <td className="px-6 py-4 text-slate-600">
                  {course.instructors.length === 0
                    ? <span className="text-slate-400 text-xs">Unassigned</span>
                    : course.instructors.map(i => i.user.name || i.user.email).join(", ")}
                </td>
                <td className="px-6 py-4 text-slate-600">{course._count.modules}</td>
                <td className="px-6 py-4 text-slate-600">{course._count.enrollments}</td>
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