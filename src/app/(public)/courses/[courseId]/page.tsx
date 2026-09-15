import { getCourseById } from "@/services/courses/courses.service";
import { hasCourseAccess } from "@/services/enrollmentService";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, Clock, BookOpen, Play, ArrowRight, Users } from "lucide-react";
import { notFound } from "next/navigation";
import EnrollButton from "./EnrollButton";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  const course = await getCourseById(params.courseId);
  if (!course) {
    return { title: "Course Not Found", robots: { index: false, follow: false } };
  }
  return {
    title: course.title,
    description: course.description,
    alternates: { canonical: `/courses/${course.id}` },
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
      url: `https://www.anmolofficial.com/courses/${course.id}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: { modules: { include: { lessons: true } } }
  });

  if (!course) notFound();

  // Server-side draft/archive access control (no client-side hiding)
  if (course.status !== "PUBLISHED") {
    const viewer = await getCurrentUser();
    if (!viewer) notFound();
    if (viewer.role === "ADMIN") {
      // admin allowed
    } else if (viewer.role === "INSTRUCTOR") {
      const assignment = await prisma.courseInstructor.findUnique({
        where: { courseId_userId: { courseId: course.id, userId: viewer.id } }
      });
      if (!assignment) notFound();
    } else {
      notFound();
    }
  }

  const user = await getCurrentUser();
  const enrolled = user ? await hasCourseAccess(user.id, course.id) : false;
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const isFree = Number(course.price) === 0;

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/courses" className="text-primary font-semibold hover:underline flex items-center gap-1 mb-6">
          ← Back to Courses <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-200 rounded-2xl h-72 flex items-center justify-center text-gray-400 mb-6">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="rounded-2xl w-full h-full object-cover" />
              ) : (
                <span className="text-sm">No thumbnail</span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-black mb-4">{course.title}</h1>
            {course.status === "DRAFT" && (
              <div className="mb-4 inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 rounded px-2 py-1 font-bold">
                DRAFT — PREVIEW ONLY
              </div>
            )}
            <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-primary fill-primary" /> 0</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> —</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-primary" /> {totalLessons} lessons</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> 0 students</span>
            </div>
            <EnrollButton courseId={course.id} isFree={isFree} isEnrolled={enrolled} />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Course Curriculum</h2>
            <div className="space-y-4">
              {course.modules.length === 0 && (
                <p className="text-gray-500 text-sm italic">No modules yet.</p>
              )}
              {[...course.modules].sort((a, b) => a.position - b.position).map((mod, modIdx) => (
                <div key={mod.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-primary/5 p-4 font-bold text-sm text-primary flex items-center justify-between">
                    <span>Module {modIdx + 1}: {mod.title}</span>
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">{mod.lessons.length} lessons</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {[...mod.lessons].sort((a, b) => a.position - b.position).map((lesson) => (
                      <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            {lesson.videoUrl ? (
                              <Play className="w-3 h-3" fill="currentColor" />
                            ) : (
                              <div className="text-xs text-gray-400">—</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{lesson.title}</p>
                            <p className="text-xs text-gray-400">{lesson.duration || "—"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}