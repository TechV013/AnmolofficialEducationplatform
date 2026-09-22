import { requireInstructor } from "@/lib/auth/helpers";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/instructor/ProfileForm";
import { notFound } from "next/navigation";

export default async function InstructorProfilePage() {
  const authUser = await requireInstructor();
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      managedCourses: {
        include: { course: true }
      }
    }
  });

  if (!user) notFound();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">Instructor Profile</h1>
        <p className="text-sm text-muted">Update your instructor bio, photo, and professional information.</p>
      </div>

      <ProfileForm user={user} />
      
      <div className="bg-white border border-border p-8 rounded-2xl shadow-sm">
        <h3 className="font-bold text-lg mb-4">Instructor Bio Preview</h3>
        <div className="flex gap-4">
          <img src={user.image || "/images/default-avatar.png"} alt={user.name || "Instructor"} className="h-16 w-16 rounded-full object-cover" />
          <div>
            <h4 className="font-bold text-text">{user.name}</h4>
            <p className="text-sm text-primary font-semibold">{user.title || "Instructor"}</p>
            <p className="text-sm text-muted mt-2 leading-relaxed">{user.bio || "No biography provided yet."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
