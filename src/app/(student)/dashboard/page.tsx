import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getStudentDashboard } from "@/services/dashboard/dashboard.service";

function DashboardSkeleton() {
  return (
    <div className="bg-background px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-slate-200 rounded mb-2 animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 rounded mb-10 animate-pulse" />
        
        <section className="mb-12">
          <div className="h-6 w-32 bg-slate-200 rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-border h-64 animate-pulse" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getStudentDashboard(user.id);

  return (
    <div className="bg-background px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Welcome back, {data.user.name || "Student"} 👋</h1>
        <p className="text-muted mb-10">Continue your learning journey.</p>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-text mb-6">My Courses</h2>
          {data.courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.courses.map((course) => (
                <div key={course.courseId} className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-text mb-2">{course.title}</h3>
                  <p className="text-sm text-muted mb-4">Instructor: {course.instructorName || "N/A"}</p>
                  <div className="w-full bg-soft-blue rounded-full h-2 mb-4">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progressPercent}%` }}></div>
                  </div>
                  <p className="text-xs text-muted mb-6">Progress: {Math.round(course.progressPercent)}%</p>
                  <Link
                    href={`/classroom/${course.courseId}/${course.lastLessonId || "first"}`}
                    className="inline-block bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-hover transition-colors"
                  >
                    {course.lastLessonTitle ? `Continue: ${course.lastLessonTitle}` : "Start Course"}
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface p-12 rounded-3xl border border-border text-center">
              <p className="text-muted mb-6">No courses enrolled yet.</p>
              <Link href="/courses" className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-colors">Browse Courses</Link>
            </div>
          )}
        </section>

        <div className="flex justify-center">
          <Link
            href="/courses"
            className="bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-colors"
          >
            Explore More Courses
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}