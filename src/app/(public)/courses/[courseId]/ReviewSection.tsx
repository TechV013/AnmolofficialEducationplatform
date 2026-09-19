"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitReview } from "./actions";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  createdByName: string;
}

export default function ReviewSection({ courseId, reviews, canReview }: {
  courseId: string;
  reviews: ReviewItem[];
  canReview: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await submitReview(courseId, rating, comment.trim() || null);
      setComment("");
      setRating(5);
      setShowForm(false);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Student Reviews</h2>
        <span className="text-sm text-slate-500">{reviews.length} reviews</span>
      </div>

      {canReview && (
        <div className="mb-8">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="bg-primary text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary-hover transition-colors">
              Write a Review
            </button>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm max-w-xl">
              <p className="font-semibold text-sm mb-3">Rate this course</p>
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                    <Star className={`w-7 h-7 transition-colors ${n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience with this course..."
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              />
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setShowForm(false); setError(null); }} className="text-sm text-slate-500 hover:underline">Cancel</button>
                <button onClick={submit} disabled={busy} className="bg-primary text-white px-5 py-2 rounded-full font-semibold text-sm disabled:opacity-60">
                  {busy ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-slate-400 text-sm">No reviews yet. Be the first to review this course.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-1 mb-2">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={`w-4 h-4 ${n <= r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                ))}
              </div>
              <p className="text-sm text-slate-500 mb-2">{r.createdByName}</p>
              {r.comment && <p className="text-slate-700 text-sm">{r.comment}</p>}
              {r.reply && (
                <div className="mt-3 bg-soft-blue rounded-lg p-3 text-sm">
                  <p className="text-xs font-bold text-primary mb-1">Instructor Response</p>
                  <p className="text-slate-700">{r.reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}