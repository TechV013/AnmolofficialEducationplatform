export const dynamic = "force-dynamic";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Manage Course — Admin", robots: { index: false, follow: false } };
import { authorizeRole } from "@/lib/auth/guard";
import { prisma } from "@/lib/prisma";
import { assignInstructor } from "../actions";
import Link from "next/link";

export default async function AdminCourseManagePage({ params }: { params: { courseId: string } }) {
  await authorizeRole("ADMIN");
  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: { modules: true, instructors: { include: { user: true } } }
  });
  if (!course) return <div className="p-12 text-xl">Course not found</div>;
  return (
    <div className="p-12 max-w-5xl mx-auto bg-background min-h-screen text-text">
      <h1 className="text-3xl font-bold mb-4">Manage Course — {course.title}</h1>
      <p className="text-muted mb-6">Status: {course.status}</p>
      <Link href="/admin/courses" className="text-primary hover:underline">Back to courses</Link>
    </div>
  );
}