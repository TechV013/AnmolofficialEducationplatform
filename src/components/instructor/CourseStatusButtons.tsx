"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCourseStatus } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { Send, PencilLine, Archive } from "lucide-react";

export default function CourseStatusButtons({ courseId, status }: { courseId: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (next: "PUBLISHED" | "DRAFT" | "ARCHIVED") => {
    setBusy(true);
    setError(null);
    try {
      await setCourseStatus(courseId, next);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="max-w-xs rounded-lg bg-red-50 px-3 py-2 text-right text-xs text-red-600">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        {status !== "PUBLISHED" ? (
          <button
            onClick={() => run("PUBLISHED")}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            Publish Course
          </button>
        ) : (
          <>
            <button
              onClick={() => run("DRAFT")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border-2 border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 disabled:opacity-60"
            >
              <PencilLine className="h-4 w-4" />
              Unpublish
            </button>
            <button
              onClick={() => run("ARCHIVED")}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <Archive className="h-4 w-4" />
              Archive
            </button>
          </>
        )}
      </div>
    </div>
  );
}