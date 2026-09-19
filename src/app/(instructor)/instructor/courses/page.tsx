export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import Badge from "@/components/ui/Badge";
import CreateCourseToggle from "@/components/instructor/CreateCourseToggle";

export const metadata: Metadata = { title: "My Courses — Instructor", robots: { index: false, follow: false } };

const STATUS_VARIANT: Record<string, "warning" | "success" | "secondary"> = {
  DRAFT: "warning",
  PUBLISHED: "success",
  ARCHIVED: "secondary",
};

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
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Courses</h1>
          <p className="text-sm text-slate-500">Create courses, add content, and publish them.</p>
        </div>
        <CreateCourseToggle />
      </div>

      {courses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-500">
          You have no courses yet. Create your first course above — you will be its author.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
          return (
            <div key={course.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-28 items-center justify-center overflow-hidden bg-soft-blue">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-10 w-10 text-primary/50" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 text-blue-600"><BookOpen className="h-5 w-5" /></div>
                    <h3 className="font-bold text-slate-900">{course.title}</h3>
                  </div>
                  <Badge variant={STATUS_VARIANT[course.status] || "secondary"}>{course.status}</Badge>
                </div>
                <p className="mb-4 line-clamp-2 text-sm text-slate-500">{course.description}</p>
                <div className="mb-4 grid grid-cols-3 gap-2 text-xs text-slate-500">
                  <span>{lessonCount} lessons</span>
                  <span>{course._count.enrollments} students</span>
                  <span>{course._count.reviews} reviews</span>
                </div>
                <div className="mt-auto space-y-2">
                  <Link href={`/instructor/courses/${course.id}`} className="block rounded-full bg-primary py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover">
                    Manage Content
                  </Link>
                  <div className="flex gap-2">
                    <Link href={`/instructor/students`} className="flex-1 rounded-full border-2 border-slate-200 py-1.5 text-center text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                      View Students
                    </Link>
                    <Link href={`/instructor/reviews`} className="flex-1 rounded-full border-2 border-slate-200 py-1.5 text-center text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                      View Reviews
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}