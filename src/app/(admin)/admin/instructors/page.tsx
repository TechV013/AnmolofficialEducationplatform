export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";

export const metadata: Metadata = { title: "Instructors — Admin", robots: { index: false, follow: false } };

export default async function AdminInstructorsPage() {
  await authorizeRole("ADMIN");

  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    orderBy: { createdAt: "desc" },
    include: {
      managedCourses: {
        include: { course: { select: { id: true, title: true } } }
      }
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Instructors</h1>
        <span className="text-sm text-slate-500">{instructors.length} Instructors</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 uppercase text-slate-500 text-xs font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Instructor</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Assigned Courses</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {instructors.map(i => (
              <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{i.name || "—"}</td>
                <td className="px-6 py-4 text-slate-600">{i.email}</td>
                <td className="px-6 py-4">
                  {i.managedCourses.length === 0 ? (
                    <span className="text-xs text-slate-400">No courses</span>
                  ) : (
                    <ul className="text-slate-600 space-y-0.5">
                      {i.managedCourses.map(m => (
                        <li key={m.courseId}>
                          <Link href={`/admin/courses/${m.course.id}`} className="hover:text-primary">{m.course.title}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${i.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {i.isActive ? "Active" : "Blocked"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}