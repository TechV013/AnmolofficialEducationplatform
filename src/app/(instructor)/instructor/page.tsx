import type { Metadata } from "next";                
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import { BookOpen, Users, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InstructorDashboardPage() {
  const user = await authorizeRole("INSTRUCTOR");

  const [instructorCourses, studentCount, reviewCount] = await Promise.all([
    prisma.course.findMany({
      where: { instructors: { some: { userId: user.id } } },
      include: { modules: { include: { lessons: true } }, _count: { select: { enrollments: true, reviews: true } } }
    }),
    prisma.enrollment.count({ where: { status: "ACTIVE", course: { instructors: { some: { userId: user.id } } } } }),
    prisma.review.count({ where: { course: { instructors: { some: { userId: user.id } } } } })
  ]);

  const totalLessons = instructorCourses.reduce((sum, c) => sum + c.modules.reduce((s, m) => s + m.lessons.length, 0), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Instructor Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link href="/instructor/courses" className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 inline-block mb-3"><BookOpen className="w-6 h-6" /></div>
          <h3 className="text-sm font-medium text-slate-500">Courses</h3>
          <p className="text-2xl font-bold text-slate-900">{instructorCourses.length}</p>
          <p className="text-xs text-slate-400 mt-1">{totalLessons} lessons</p>
        </Link>
        <Link href="/instructor/students" className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 inline-block mb-3"><Users className="w-6 h-6" /></div>
          <h3 className="text-sm font-medium text-slate-500">Students</h3>
          <p className="text-2xl font-bold text-slate-900">{studentCount}</p>
          <p className="text-xs text-slate-400 mt-1">active enrollments</p>
        </Link>
        <Link href="/instructor/reviews" className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600 inline-block mb-3"><MessageSquare className="w-6 h-6" /></div>
          <h3 className="text-sm font-medium text-slate-500">Reviews</h3>
          <p className="text-2xl font-bold text-slate-900">{reviewCount}</p>
          <p className="text-xs text-slate-400 mt-1">awaiting your replies</p>
        </Link>
      </div>

      <h2 className="text-xl font-semibold text-slate-700 mb-6">My Assigned Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructorCourses.map(course => (
          <div key={course.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900">{course.title}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>
            <div className="flex gap-2">
              <Link href={`/instructor/courses/${course.id}`} className="flex-1 text-center text-sm font-medium text-primary border border-primary/30 rounded-full py-2 hover:bg-primary/5">
                Manage Content
              </Link>
              <Link href="/instructor/students" className="flex-1 text-center text-sm font-medium text-slate-600 border border-slate-200 rounded-full py-2 hover:bg-slate-50">
                {course._count.enrollments} students
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}