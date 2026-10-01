import { requireInstructor } from "@/lib/auth/helpers";
import { getCourseForInstructor } from "@/services/courses/instructor.service";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle2, Clock, Download, ExternalLink } from "lucide-react";
import SubmissionGrader from "@/components/instructor/SubmissionGrader";

function isHostedFile(url: string): boolean {
  return url.startsWith("/uploads/") || url.startsWith("data:") || url.startsWith("http://localhost");
}

function formatDate(value: Date | null): string {
  if (!value) return "—";
  return value.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Typed responses are persisted as data URIs, so render them inline. */
function submissionText(fileUrl: string | null): string | null {
  if (!fileUrl) return null;
  if (!fileUrl.startsWith("data:text/plain")) return null;
  const comma = fileUrl.indexOf(",");
  if (comma === -1) return null;
  try {
    return decodeURIComponent(fileUrl.slice(comma + 1));
  } catch {
    return null;
  }
}

export default async function CourseSubmissionsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireInstructor();
  const course = await getCourseForInstructor(courseId, user.id);
  if (!course) notFound();

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignment: { lesson: { module: { courseId } } } },
    include: {
      user: { select: { id: true, name: true, email: true } },
      assignment: { include: { lesson: { select: { id: true, title: true } } } }
    },
    orderBy: { submittedAt: "desc" }
  });

  const pending = submissions.filter((s) => s.status === "SUBMITTED").length;
  const graded = submissions.filter((s) => s.status === "REVIEWED").length;

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/instructor/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course Studio</span>
          </Link>
          <h1 className="mt-3 text-2xl font-extrabold text-text">Assignment Submissions</h1>
          <p className="mt-1 text-sm text-muted">{course.title}</p>
        </div>
        <div className="flex gap-3">
          <span className="rounded-full bg-sky-100 px-3.5 py-1.5 text-xs font-bold text-sky-700">
            {pending} awaiting review
          </span>
          <span className="rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
            {graded} graded
          </span>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-10 text-center">
          <p className="text-sm font-semibold text-text">No submissions yet</p>
          <p className="mt-1 text-sm text-muted">
            Student submissions for this course&apos;s assignments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => {
            const text = submissionText(s.fileUrl);
            const fileLink = text ? null : s.fileUrl;
            return (
              <div key={s.id} className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-text">{s.user.name}</p>
                    <p className="truncate text-xs text-muted">{s.user.email}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                    {s.assignment.lesson.title}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(s.submittedAt)}
                  </span>
                  {s.status === "REVIEWED" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Graded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                      Awaiting review
                    </span>
                  )}
                </div>

                {text ? (
                  <p className="whitespace-pre-line rounded-xl border border-border bg-surface p-3 text-sm leading-relaxed text-slate-700">
                    {text}
                  </p>
                ) : fileLink ? (
                  <a
                    href={fileLink}
                    {...(isHostedFile(fileLink) ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-soft-blue"
                  >
                    {isHostedFile(fileLink) ? (
                      <Download className="h-3.5 w-3.5" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5" />
                    )}
                    {isHostedFile(fileLink) ? "Download submission" : "Open submission"}
                  </a>
                ) : (
                  <p className="text-sm text-muted">No content submitted.</p>
                )}

                {s.status === "REVIEWED" && s.score !== null && (
                  <p className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                    <Award className="h-4 w-4" /> Score: {s.score}
                  </p>
                )}

                <SubmissionGrader
                  submissionId={s.id}
                  courseId={courseId}
                  initialScore={s.score}
                  initialFeedback={s.feedback}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
