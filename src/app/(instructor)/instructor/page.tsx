import { requireInstructor } from "@/lib/auth/helpers";
import { getInstructorCourses } from "@/services/courses/instructor.service";
import Link from "next/link";
import { Plus, BookOpen, Users, Award } from "lucide-react";
import InstructorCourseCard from "@/components/courses/InstructorCourseCard";

export default async function InstructorDashboardPage() {
  const user = await requireInstructor();
  const courses = await getInstructorCourses(user.id);

  const totalStudents = courses.reduce((acc, c: any) => acc + (c.studentCount || 0), 0);
  const publishedCount = courses.filter((c: any) => c.status === "PUBLISHED").length;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Instructor Dashboard</h1>
            <p className="mt-1 text-sm text-muted">Welcome back, {user.name || "Instructor"}. Manage your courses and lessons.</p>
          </div>
          <Link href="/instructor/courses/new" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-hover transition-all">
            <Plus className="h-5 w-5" />
            <span>Create New Course</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-soft-blue text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Total Courses</p>
              <p className="text-2xl font-bold text-text">{courses.length} ({publishedCount} published)</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Total Students</p>
              <p className="text-2xl font-bold text-text">{totalStudents}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Instructor Status</p>
              <p className="text-2xl font-bold text-text">Active</p>
            </div>
          </div>
        </div>

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
    </div>
  );
}
