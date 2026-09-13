import type { Metadata } from "next";
export const metadata: Metadata = { title: "Manage Course — Admin", robots: { index: false, follow: false } };
import { authorizeRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { assignInstructor } from "@/app/admin/courses/actions";
import Link from "next/link";

export default async function AdminCourseManagePage({ params }: { params: { courseId: string } }) {
  await authorizeRole("ADMIN");
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      instructors: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      modules: { include: { lessons: true } }
    }
  });
  if (!course) return <div className="p-12">Course not found.</div>;

  // Find eligible instructors (users with INSTRUCTOR role, not already assigned)
  const allInstructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    select: { id: true, name: true, email: true }
  });
  const assignedIds = new Set(course.instructors.map(i => i.userId));
  const eligibleInstructors = allInstructors.filter(u => !assignedIds.has(u.id));

  return (
    <div className="p-12 max-w-5xl mx-auto bg-background min-h-screen text-text">
      <h1 className="text-3xl font-bold mb-2">Manage Course: {course.title}</h1>
      <p className="text-muted mb-6">Status: <span className="font-bold">{course.status}</span></p>

      <Link href="/admin/courses/create" className="text-sm text-primary hover:underline">Create new course →</Link>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Instructors */}
        <div className="bg-surface p-6 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Assigned Instructors</h2>
          <ul className="space-y-2 mb-4">
            {course.instructors.length === 0 ? (
              <li className="text-muted italic">No instructors assigned.</li>
            ) : (
              course.instructors.map(i => (
                <li key={i.userId} className="text-sm font-medium bg-background p-2 rounded border">
                  {i.user?.name || "Unnamed"} ({i.user?.email || "—"})
                </li>
              ))
            )}
          </ul>

          <h3 className="font-bold text-sm mb-2">Assign Instructor</h3>
          <form action={assignInstructor.bind(null, course.id)} className="flex gap-2 items-end">
            <select name="userId" required className="flex-1 p-2 border rounded-lg bg-background">
              <option value="">Select instructor...</option>
              {eligibleInstructors.map(u => (
                <option key={u.id} value={u.id}>{u.name || u.email}</option>
              ))}
            </select>
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Assign</button>
          </form>
        </div>

        {/* Course Overview */}
        <div className="bg-surface p-6 rounded-2xl border shadow-sm">
          <h2 className="text-xl font-bold mb-4">Course Overview</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Slug:</span> {course.slug}</p>
            <p><span className="font-medium">Category:</span> {course.category}</p>
            <p><span className="font-medium">Level:</span> {course.level}</p>
            <p><span className="font-medium">Price:</span> ₹{course.price.toString()}</p>
            <p><span className="font-medium">Modules:</span> {course.modules.length}</p>
            <p><span className="font-medium">Lessons:</span> {course.modules.reduce((s, m) => s + m.lessons.length, 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}