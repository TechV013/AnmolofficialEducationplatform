export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { authorizeRole } from "@/lib/auth/guard";
import { Star } from "lucide-react";
import ReviewReplyForm from "./ReviewReplyForm";

export const metadata: Metadata = { title: "Reviews — Instructor", robots: { index: false, follow: false } };

export default async function InstructorReviewsPage() {
  const user = await authorizeRole("INSTRUCTOR");

  const reviews = await prisma.review.findMany({
    where: { course: { instructors: { some: { userId: user.id } } } },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { id: true, title: true } },
      repliedBy: { select: { name: true } }
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Course Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">Feedback from your students — reply to engage.</p>
        </div>
        <span className="text-sm text-slate-500">{reviews.length} Reviews</span>
      </div>

      {reviews.length === 0 && (
        <div className="bg-white p-10 rounded-xl border border-slate-200 text-center text-slate-500">
          No reviews yet. Reviews from your students will appear here.
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{r.user.name || r.user.email}</p>
                <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()} · {r.course?.title}</p>
                <div className="flex items-center gap-0.5 mt-2">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-slate-600 mt-3">{r.comment || <span className="text-slate-400 italic">No comment.</span>}</p>
            <ReviewReplyForm
              reviewId={r.id}
              initialReply={r.reply}
              repliedBy={r.repliedBy?.name ?? null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}