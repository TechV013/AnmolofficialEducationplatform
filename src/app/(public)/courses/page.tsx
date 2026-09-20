import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Explore Courses — Anmolofficial",
  description: "Browse creative skill courses - 3D Modeling, Animation, Rigging, Video Editing and more.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Explore Courses — Anmolofficial",
    description: "Browse creative skill courses - 3D Modeling, Animation, Rigging, Video Editing and more.",
    type: "website",
    url: "https://www.anmolofficial.com/courses",
  },
};

import { getPublishedCourses } from "@/services/courses/courses.service";
import { getUserCourseProgress } from "@/services/courses/progress.service";
import { getCurrentUser } from "@/lib/auth/helpers";
import { parseFilters, filterCourses, getCategories } from "@/lib/course-filters";
import CourseCard from "@/components/home/CourseCard";
import CourseFilters from "@/components/courses/CourseFilters";
import { SearchX, LogIn } from "lucide-react";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;

  const courses = await getPublishedCourses();

  const user = await getCurrentUser();
  const isStudent = user?.role === "STUDENT";
  const progressByCourse = isStudent
    ? await getUserCourseProgress(user.id!, courses.map((c) => c.id))
    : null;

  const filters = parseFilters({
    tab: typeof sp.tab === "string" ? sp.tab : undefined,
    category: typeof sp.category === "string" ? sp.category : undefined,
    free: typeof sp.free === "string" ? sp.free : undefined,
    duration: typeof sp.duration === "string" ? sp.duration : undefined,
  });

  const categories = getCategories(courses);
  const visible = filterCourses(courses, filters, progressByCourse);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-[#0B1E3C] via-[#123A6D] to-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12">
          <p className="uppercase tracking-[0.2em] text-xs font-bold text-white/70 mb-3">Anmolofficial</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Explore Courses</h1>
          <p className="mt-3 max-w-xl text-white/80 text-sm sm:text-base">
            Structured, industry-relevant creative skills courses — from 3D modeling and rigging to editing and VFX.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-4 sm:p-5 mb-8">
          <Suspense fallback={<div className="h-24" />}>
            <CourseFilters
              isStudent={isStudent}
              categories={categories}
              initial={{
                tab: filters.tab,
                category: filters.category,
                freeOnly: filters.freeOnly,
                duration: filters.duration,
              }}
            />
          </Suspense>
        </div>

        {visible.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted">
                Showing <span className="font-bold text-text">{visible.length}</span> of {courses.length} courses
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
            <SearchX className="w-10 h-10 mx-auto text-muted mb-3" />
            {filters.tab !== "all" && !isStudent ? (
              <>
                <h3 className="text-lg font-bold text-text mb-1">Your courses are waiting</h3>
                <p className="text-sm text-muted mb-4">Sign in as a student to track your in-progress and completed courses.</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-hover transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-text mb-1">No courses match these filters</h3>
                <p className="text-sm text-muted mb-4">Try clearing a filter or two to widen the results.</p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primary-hover transition-colors"
                >
                  Clear all filters
                </Link>
              </>
            )}
          </div>
        )}

        {visible.length > 0 && (
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-border shadow-sm p-6">
            <div>
              <h3 className="font-bold text-text">Can&apos;t decide which course fits you?</h3>
              <p className="text-sm text-muted mt-1">Message us on WhatsApp and we&apos;ll help you pick the right track.</p>
            </div>
            <a
              href="https://wa.me/917073345025"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-[#25D366] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#1DA851] transition-colors shadow-md shadow-[#25D366]/20"
            >
              Chat On WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}