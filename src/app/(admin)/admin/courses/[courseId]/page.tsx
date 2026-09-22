export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { authorizeRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = { title: "Manage Course — Admin", robots: { index: false, follow: false } };

export default async function AdminCourseManagePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  await authorizeRole("ADMIN");
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { orderBy: { position: "asc" }, include: { lessons: { orderBy: { position: "asc" } } } },
      instructors: { include: { user: true } },
      _count: { select: { enrollments: true, reviews: true } }
    }
  });
  if (!course) return <div className="p-12 text-xl">Course not found</div>;

  const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <Link href="/admin/courses" className="text-sm text-primary hover:underline">← Back to courses</Link>
      <div className="flex justify-between items-start mt-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted mt-1">
            Status: <span className="font-semibold">{course.status}</span> · ₹{Number(course.price)} · {lessonCount} lessons · {course._count.enrollments} students
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link
          href={`/instructor/courses/${course.id}`}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="font-bold mb-2">Edit Curriculum</h3>
          <p className="text-sm text-slate-500">Add modules, lessons, videos, PDFs, quizzes and assignments.</p>
        </Link>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-2">Instructors</h3>
          {course.instructors.length === 0 ? (
            <p className="text-sm text-slate-500">No instructors assigned. Assign one from the course list.</p>
          ) : (
            <ul className="text-sm text-slate-600 space-y-1">
              {course.instructors.map(i => (
                <li key={i.userId}>{i.user.name || i.user.email}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-2">Curriculum Overview</h3>
          <p className="text-sm text-slate-600">{course.modules.length} modules · {lessonCount} lessons</p>
        </div>
      </div>
    </div>
  );
}