export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Instructors — Admin", robots: { index: false, follow: false } };

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Instructors</h1>
          <p className="text-sm text-slate-500">Accounts that can teach and manage courses</p>
        </div>
        <Badge variant="info">{instructors.length} Instructors</Badge>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3 text-left">Instructor</th>
              <th className="px-6 py-3 text-left">Assigned Courses</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {instructors.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-400">No instructors yet.</td>
              </tr>
            )}
            {instructors.map((i) => (
              <tr key={i.id} className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                      {initials(i.name)}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{i.name || "—"}</p>
                      <p className="text-xs text-slate-500">{i.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {i.managedCourses.length === 0 ? (
                    <span className="text-xs text-slate-400">No courses</span>
                  ) : (
                    <ul className="space-y-0.5 text-slate-700">
                      {i.managedCourses.map((m) => (
                        <li key={m.courseId}>
                          <Link href={`/admin/courses/${m.course.id}`} className="hover:text-primary">
                            {m.course.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={i.isActive ? "success" : "danger"}>{i.isActive ? "Active" : "Blocked"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}