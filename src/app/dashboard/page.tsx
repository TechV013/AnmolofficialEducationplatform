"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { courses } from "@/data/courses";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      router.push("/login");
    }
    try {
      const enrolled = JSON.parse(localStorage.getItem("enrolled_courses") || "[]");
      setEnrolledIds(enrolled);
    } catch {}
  }, [router]);

  const enrolledCourses = courses.filter((c) => enrolledIds.includes(c.id));

  const progress = {
    "1": { lessonId: "1.4", position: 1820, completed: false },
  };

  return (
    <main className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-black mb-2">Welcome back 👋</h1>
        <p className="text-gray-500 mb-10">Here's what's happening with your learning.</p>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            ▶ Continue Learning
          </h2>
          {enrolledCourses.length > 0 ? enrolledCourses.map((course) => {
            const p = progress[course.id as keyof typeof progress];
            const pct = p ? Math.round((p.position / 2400) * 100) : 0;
            return (
              <div key={course.id} className="bg-white p-6 rounded-2xl shadow-sm border mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-full sm:w-32 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                  {course.category}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-500">Module 2 • Lesson 4</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pct}% complete</p>
                </div>
                <Link
                  href={`/classroom/${course.id}/${p?.lessonId || "1.1"}`}
                  className="bg-primary text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-primary-hover transition-colors flex-shrink-0"
                >
                  Continue →
                </Link>
              </div>
            );
          }) : (
            <div className="bg-white p-8 rounded-2xl text-center text-gray-500">
              <p className="mb-4">No courses enrolled yet.</p>
              <Link href="/courses" className="text-primary font-semibold hover:underline">Browse Courses</Link>
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-bold text-black mb-6">My Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl overflow-hidden border shadow-sm">
                <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                  {course.category}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-2">{course.title}</h3>
                  <div className="w-full h-2 bg-gray-100 rounded-full mb-3">
                    <div className="h-full bg-primary rounded-full" style={{ width: "72%" }} />
                  </div>
                  <p className="text-xs text-gray-400 mb-3">72% complete</p>
                  <Link href={`/courses/${course.id}`} className="text-primary text-sm font-semibold hover:underline">
                    View Course →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-6">Upcoming Assignments</h2>
          <div className="bg-white rounded-2xl p-6">
            <p className="text-gray-500 text-sm">No assignments due at this time.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
