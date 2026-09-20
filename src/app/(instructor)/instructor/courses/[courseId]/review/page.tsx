import { requireInstructor } from "@/lib/auth/helpers";
import { getCourseForInstructor, getCourseEngagement } from "@/services/courses/instructor.service";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CourseReviewDashboard from "@/components/courses/CourseReviewDashboard";

export default async function CourseReviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireInstructor();
  const course = await getCourseForInstructor(courseId, user.id);
  if (!course) notFound();

  const stats = await getCourseEngagement(courseId);
  const reviews = await prisma.review.findMany({
    where: { courseId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/instructor/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-text mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Course Editor</span>
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Engagement & Reviews: {course.title}</h1>
          <p className="mt-1 text-sm text-muted">Monitor student progress, ratings, and feedback.</p>
        </div>
        <CourseReviewDashboard stats={stats} reviews={reviews} />
      </div>
    </div>
  );
}
