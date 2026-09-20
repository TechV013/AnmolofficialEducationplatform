import { requireInstructor } from "@/lib/auth/helpers";
import { getInstructorCourses } from "@/services/courses/instructor.service";
import Link from "next/link";
import { Plus, BookOpen, Users, Award } from "lucide-react";
import InstructorCourseCard from "@/components/courses/InstructorCourseCard";

export default async function InstructorDashboardPage() {
  const user = await requireInstructor();
  
  let courses: any[] = [];
  let dbError: string | null = null;

  try {
    courses = await getInstructorCourses(user.id);
  } catch (err) {
    console.error("InstructorDashboard DB fetch error:", err);
    dbError = "Database connection error or cold start. Please refresh the page.";
  }

  const totalStudents = courses.reduce((acc, c: any) => acc + (c.studentCount || 0), 0);
  const publishedCount = courses.filter((c: any) => c.status === "PUBLISHED").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Instructor Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Welcome back, {user.name || "Instructor"}. Manage your courses and lessons.</p>
        </div>
        <Link href="/instructor/courses/new" className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-all shrink-0">
          <Plus className="h-5 w-5" />
          <span>Create New Course</span>
        </Link>
      </div>

      {dbError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
          <p className="font-bold">⚠️ {dbError}</p>
          <p className="text-xs mt-1 text-red-500">Neon serverless DB might be waking up from cold start.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-soft-blue text-primary shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted truncate">Total Courses</p>
                <p className="text-xl sm:text-2xl font-bold text-text truncate">{courses.length} ({publishedCount} published)</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted truncate">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-text truncate">{totalStudents}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
                <Award className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted truncate">Instructor Status</p>
                <p className="text-xl sm:text-2xl font-bold text-text truncate">Active</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-text mb-6">Your Courses</h2>
            {courses.length === 0 ? (
              <div className="rounded-2xl border border-border bg-white p-12 text-center">
                <p className="text-muted">You haven't created any courses yet.</p>
                <Link href="/instructor/courses/new" className="mt-4 inline-block text-primary font-bold hover:underline">Create your first course →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <InstructorCourseCard key={course.id} course={course} onDelete={async (id) => {
                    "use server";
                    await fetch(`/api/courses/${id}`, { method: "DELETE" });
                  }} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
