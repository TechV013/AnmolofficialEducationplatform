export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "My Courses — Instructor", robots: { index: false, follow: false } };

export default async function InstructorCoursesPage() {
  const user = await authorizeRole("INSTRUCTOR");

  const courses = await prisma.course.findMany({
    where: { instructors: { some: { userId: user.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { modules: true, enrollments: true, reviews: true } },
      modules: { select: { lessons: { select: { id: true } } } }
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Courses</h1>
          <p className="text-sm text-slate-500 mt-1">Courses assigned to you — manage content, students and reviews.</p>
        </div>
        <span className="text-sm text-slate-500">{courses.length} Courses</span>
      </div>

      {courses.length === 0 && (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-500">
          No courses assigned yet. The admin will assign courses to you.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
          return (
            <div key={course.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-bold text-slate-900">{course.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                    course.status === "ARCHIVED" ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-700"
                  }`}>{course.status}</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
              <div className="text-xs text-slate-500 mb-4 grid grid-cols-3 gap-2">
                <span>{lessonCount} lessons</span>
                <span>{course._count.enrollments} students</span>
                <span>{course._count.reviews} reviews</span>
              </div>
              <div className="mt-auto space-y-2">
                <Link href={`/instructor/courses/${course.id}`} className="block text-center text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full py-2">
                  Manage Content
                </Link>
                <div className="flex gap-2">
                  <Link href={`/instructor/students`} className="flex-1 text-center text-xs font-medium text-slate-600 border border-slate-200 rounded-full py-1.5 hover:bg-slate-50">
                    View Students
                  </Link>
                  <Link href={`/instructor/reviews`} className="flex-1 text-center text-xs font-medium text-slate-600 border border-slate-200 rounded-full py-1.5 hover:bg-slate-50">
                    View Reviews
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}