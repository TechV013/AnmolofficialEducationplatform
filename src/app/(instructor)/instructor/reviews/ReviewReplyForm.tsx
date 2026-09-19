"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateReviewReply } from "./actions";

export default function ReviewReplyForm({ reviewId, initialReply, repliedBy }: {
  reviewId: string;
  initialReply: string | null;
  repliedBy: string | null;
}) {
  const [reply, setReply] = useState(initialReply ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const save = async (value: string | null) => {
    setError(null);
    setBusy(true);
    try {
      await updateReviewReply(reviewId, value);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-500 mb-2">
          Instructor reply {repliedBy ? `by ${repliedBy}` : ""}
        </p>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={2}
          placeholder="Respond to this review..."
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        />
        <div className="flex gap-2 mt-2 justify-end">
          <button
            onClick={() => save(null)}
            disabled={busy || !initialReply}
            className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-40"
          >
            Remove reply
          </button>
          <button
            onClick={() => save(reply)}
            disabled={busy || reply.trim() === initialReply}
            className="text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-full px-4 py-1.5 disabled:opacity-50"
          >
            {busy ? "Saving..." : initialReply ? "Update reply" : "Post reply"}
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}