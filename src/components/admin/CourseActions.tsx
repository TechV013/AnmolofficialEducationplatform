"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCourseStatus, assignInstructor, unassignInstructor, deleteCourse } from "@/app/(admin)/admin/courses/actions";
import type { CourseStatus, UserRole } from "@prisma/client";

interface CourseInstructor {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
}

interface AssignedInstructor {
  userId: string;
  user: CourseInstructor;
}

export default function CourseActions({ courseId, status, instructors, assigned }: {
  courseId: string;
  status: CourseStatus;
  instructors: CourseInstructor[];
  assigned: AssignedInstructor[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    setBusy(true);
    try {
      await fn();
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = (e: React.ChangeEvent<HTMLSelectElement>) =>
    run(() => updateCourseStatus(courseId, e.target.value as CourseStatus));

  const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) =>
    run(() => assignInstructor(courseId, e.target.value));

  const assignedIds = assigned.map(a => a.userId);
  const unassignedInstructors = instructors.filter(i => i.role === "INSTRUCTOR" && !assignedIds.includes(i.id));

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <select
          value={status}
          onChange={handleStatus}
          disabled={busy}
          className={`border rounded px-2 py-1 text-xs font-semibold ${
            status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            status === "ARCHIVED" ? "bg-slate-100 text-slate-600 border-slate-200" :
            "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        {unassignedInstructors.length > 0 && (
          <select
            defaultValue=""
            onChange={handleAssign}
            disabled={busy}
            className="border rounded px-2 py-1 text-xs text-slate-700"
          >
            <option value="" disabled>Assign instructor...</option>
            {unassignedInstructors.map(i => (
              <option key={i.id} value={i.id}>{i.name || i.email}</option>
            ))}
          </select>
        )}
      </div>
      {assigned.map(a => (
        <button
          key={a.userId}
          onClick={() => run(() => unassignInstructor(courseId, a.userId))}
          disabled={busy}
          className="text-xs text-slate-500 hover:text-red-600 underline"
        >
          {a.user.name || a.user.email} · remove
        </button>
      ))}
      <button
        onClick={() => { if (confirm("Delete this course and all its content?")) run(() => deleteCourse(courseId)); }}
        disabled={busy}
        className="text-xs text-red-500 hover:text-red-700 font-medium"
      >
        Delete course
      </button>
    </div>
  );
}