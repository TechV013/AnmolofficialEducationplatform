import { requireAdmin } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import { deleteCourse } from "@/services/courses/instructor.service";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import AdminCourseTable from "@/components/courses/AdminCourseTable";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const courses = await prisma.course.findMany({
    include: { instructors: { include: { user: { select: { name: true } } } } }
  });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true }
  });

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-muted">Manage all platform courses and promote instructors.</p>
          </div>
        </div>
        <AdminCourseTable
          courses={courses}
          users={users}
          onDeleteCourse={async (id) => {
            "use server";
            try {
              await deleteCourse(id);
              revalidatePath("/admin");
            } catch (err) {
              console.error("Admin delete course error:", err);
              throw err;
            }
          }}
          onPromoteUser={async (id) => {
            "use server";
            try {
              await prisma.user.update({
                where: { id },
                data: { role: UserRole.INSTRUCTOR }
              });
              revalidatePath("/admin");
            } catch (err) {
              console.error("Admin promote user error:", err);
              throw err;
            }
          }}
        />
      </div>
    </div>
  );
}
