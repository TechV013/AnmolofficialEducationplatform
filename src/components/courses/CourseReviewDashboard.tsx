"use client";
import { Users, Star, BookOpen, CheckCircle2, MessageSquare } from "lucide-react";

export default function CourseReviewDashboard({ stats, reviews }: { stats: any; reviews: any[] }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted">Total Enrollments</p>
          <p className="mt-2 text-3xl font-bold text-text">{stats.totalEnrollments}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted">Completed Students</p>
          <p className="mt-2 text-3xl font-bold text-text">{stats.completedStudents}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted">Average Rating</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl font-bold text-text">{stats.avgRating.toFixed(1)}</span>
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-muted">Total Reviews</p>
          <p className="mt-2 text-3xl font-bold text-text">{stats.totalReviews}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4">Student Comments & Feedback</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No reviews or comments yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {reviews.map((r: any) => (
              <div key={r.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text text-sm">{r.user?.name || "Student"}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-muted">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
