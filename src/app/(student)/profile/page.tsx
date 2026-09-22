import { requireStudent } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/instructor/ProfileForm";
import { notFound } from "next/navigation";
import { BookOpen, Award } from "lucide-react";

export default async function StudentProfilePage() {
  const authUser = await requireStudent();
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      _count: {
        select: {
          enrollments: true,
          certificates: true,
        }
      }
    }
  });

  if (!user) notFound();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">Student Profile</h1>
        <p className="text-sm text-muted">Manage your public information, avatar, and contact details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-border p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase">Enrolled Courses</p>
            <p className="text-2xl font-bold text-text">{user._count.enrollments}</p>
          </div>
        </div>
        <div className="bg-white border border-border p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted uppercase">Certificates Earned</p>
            <p className="text-2xl font-bold text-text">{user._count.certificates}</p>
          </div>
        </div>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
