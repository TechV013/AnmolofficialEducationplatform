import type { Metadata } from "next";                
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InstructorDashboardPage() {
  const user = await authorizeRole("INSTRUCTOR");

  const instructorCourses = await prisma.course.findMany({
    where: { instructors: { some: { userId: user.id } } },
    include: { modules: { include: { lessons: true } } }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Instructor Dashboard</h1>
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
            <Link href={`/instructor/courses/${course.id}`} className="inline-block text-sm font-medium text-primary hover:text-primary/80">
                Manage Content &rarr;
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}