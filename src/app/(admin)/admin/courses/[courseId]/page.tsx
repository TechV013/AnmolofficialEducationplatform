export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { authorizeRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Pencil } from "lucide-react";
import CourseEditForm from "@/components/admin/CourseEditForm";

export const metadata: Metadata = { title: "Manage Course — Admin", robots: { index: false, follow: false } };

export default async function AdminCourseManagePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  await authorizeRole("ADMIN");
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { orderBy: { position: "asc" }, include: { lessons: { orderBy: { position: "asc" } } } },
      instructors: { include: { user: true } },
      _count: { select: { enrollments: true, reviews: true } }
    }
  });
  if (!course) return <div className="p-12 text-xl">Course not found</div>;

  const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="p-12 max-w-5xl mx-auto">
      <Link href="/admin/courses" className="text-sm text-primary hover:underline">Back to courses</Link>
      <div className="flex justify-between items-start mt-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted mt-1">
            Status: {course.status} · {Number(course.price)} · {lessonCount} lessons · {course._count.enrollments} students · {course._count.reviews} reviews
          </p>
        </div>
        <Link
          href={`/instructor/courses/${course.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
        >
          <Pencil className="h-4 w-4" />
          Edit Curriculum
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Course Information</h3>
          <CourseEditForm
            courseId={courseId}
            course={{
              title: course.title,
              description: course.description,
              category: course.category,
              level: course.level,
              price: Number(course.price),
              priceOld: course.priceOld ? Number(course.priceOld) : null,
              thumbnail: course.thumbnail,
              slug: course.slug,
              promoVideoUrl: course.promoVideoUrl || null,
            }}
            onClose={() => {}}
          />
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Modules</span><span className="font-semibold">{course.modules.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Lessons</span><span className="font-semibold">{lessonCount}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Enrolled Students</span><span className="font-semibold">{course._count.enrollments}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Reviews</span><span className="font-semibold">{course._count.reviews}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Created</span><span className="font-semibold">{new Date(course.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Instructors</h3>
            {course.instructors.length === 0 ? (
              <p className="text-sm text-slate-500">No instructors assigned.</p>
            ) : (
              <ul className="text-sm text-slate-600 space-y-1">
                {course.instructors.map(i => (
                  <li key={i.userId}>{i.user.name || i.user.email}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}