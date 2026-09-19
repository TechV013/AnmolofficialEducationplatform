export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/auth/helpers";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { ClipboardList, CheckCircle2, Clock } from "lucide-react";

export const metadata: Metadata = { title: "My Assignments", robots: { index: false, follow: false } };

function initials(name: string | null) {
  if (!name) return "?";
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export default async function AssignmentsPage() {
  const user = await requireStudent();

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { userId: user.id },
    orderBy: { submittedAt: "desc" },
    include: {
      assignment: {
        include: {
          lesson: { include: { module: { include: { course: true } } } }
        }
      }
    }
  });

  const graded = submissions.filter((s) => s.status === "REVIEWED");
  const pending = submissions.filter((s) => s.status !== "REVIEWED");

  const summary = [
    { label: "Submitted", value: submissions.length, icon: ClipboardList, color: "bg-blue-50 text-blue-600", bar: "border-l-blue-500" },
    { label: "Awaiting Review", value: pending.length, icon: Clock, color: "bg-amber-50 text-amber-600", bar: "border-l-amber-500" },
    { label: "Graded", value: graded.length, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", bar: "border-l-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Assignments</h1>
        <p className="text-sm text-slate-500">Submissions and instructor feedback across your courses</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.label} className={`rounded-2xl border border-border border-l-4 bg-white p-5 shadow-sm ${s.bar}`}>
            <div className={`mb-3 inline-flex rounded-lg p-2.5 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{s.value}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {submissions.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">
            You have no assignment submissions yet. Complete a lesson with an assignment to get started.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {submissions.map((s) => (
              <li key={s.id} className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {initials(s.assignment.lesson.module.course.title)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/classroom/${s.assignment.lesson.module.courseId}/${s.assignment.lesson.id}`} className="font-medium text-slate-900 hover:text-primary">
                      {s.assignment.lesson.module.course.title} — {s.assignment.lesson.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Submitted {new Date(s.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  {s.status === "REVIEWED" ? (
                    <Badge variant="success">Graded{s.score !== null ? ` · ${s.score}` : ""}</Badge>
                  ) : (
                    <Badge variant="warning">Awaiting review</Badge>
                  )}
                </div>

                <p className="mt-3 rounded-lg border border-border/60 bg-slate-50 p-3 text-sm text-slate-600">
                  {s.fileUrl || "No content"}
                </p>

                {s.status === "REVIEWED" && s.feedback && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Instructor feedback</p>
                    <p className="mt-1 text-sm text-slate-700">{s.feedback}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}