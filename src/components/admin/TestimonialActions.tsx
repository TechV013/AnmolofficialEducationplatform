"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowUp, ArrowDown, Trash2, Loader2 } from "lucide-react";
import {
  deleteTestimonial,
  toggleTestimonialPublished,
  moveTestimonial,
} from "@/app/(admin)/admin/testimonials/actions";

export default function TestimonialActions({
  id,
  isPublished,
  canMoveUp,
  canMoveDown,
}: {
  id: string;
  isPublished: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (fn: () => Promise<unknown>, done?: () => void) => {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        done?.();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        done?.();
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          title={isPublished ? "Unpublish" : "Publish"}
          disabled={pending}
          onClick={() => run(() => toggleTestimonialPublished(id, !isPublished))}
          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
            isPublished
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isPublished ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <EyeOff className="h-3.5 w-3.5" />
          )}
          {isPublished ? "Published" : "Draft"}
        </button>

        <button
          type="button"
          title="Move up"
          aria-label="Move up"
          disabled={pending || !canMoveUp}
          onClick={() => run(() => moveTestimonial(id, "up"))}
          className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          title="Move down"
          aria-label="Move down"
          disabled={pending || !canMoveDown}
          onClick={() => run(() => moveTestimonial(id, "down"))}
          className="rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
        >
          <ArrowDown className="h-3.5 w-3.5" />
        </button>

        {confirming ? (
          <span className="inline-flex items-center gap-1.5">
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => deleteTestimonial(id), () => setConfirming(false))}
              className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Yes, delete
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(false)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
