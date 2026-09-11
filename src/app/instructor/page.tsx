import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import Link from "next/link";

export default async function InstructorDashboardPage() {
  const user = await authorizeRole("INSTRUCTOR");

  const instructorCourses = await prisma.course.findMany({
    where: { instructors: { some: { userId: user.id } } },
    include: { modules: { include: { lessons: true } } }
  });

  return (
    <div className="p-12">
        <h1 className="text-3xl font-bold mb-8">Instructor Dashboard</h1>
        <h2 className="text-xl font-bold mb-4">My Assigned Courses</h2>
        {instructorCourses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-xl border mb-4">
                <h3 className="font-bold">{course.title}</h3>
                <Link href={`/instructor/courses/${course.id}`} className="text-primary hover:underline">Manage Content</Link>
            </div>
        ))}
    </div>
  );
}
