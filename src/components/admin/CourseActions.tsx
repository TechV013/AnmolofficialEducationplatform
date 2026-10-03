"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCourseStatus, deleteCourse, updateCoursePrice } from "@/app/(admin)/admin/courses/actions";
import type { CourseStatus } from "@prisma/client";
import { Pencil, Trash2, Save, Loader2 } from "lucide-react";

export default function CourseActions({ courseId, status, price, priceOld }: {
  courseId: string;
  status: CourseStatus;
  price: number;
  priceOld: number | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [priceVal, setPriceVal] = useState(String(price));
  const [priceOldVal, setPriceOldVal] = useState(priceOld !== null ? String(priceOld) : "");
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

  const startEdit = () => {
    setError(null);
    setPriceVal(String(price));
    setPriceOldVal(priceOld !== null ? String(priceOld) : "");
    setEditing(true);
  };

  const savePrice = () =>
    run(async () => {
      const parsed = priceOldVal.trim() === "" ? null : Number(priceOldVal);
      await updateCoursePrice(courseId, Number(priceVal), parsed);
      setEditing(false);
    });

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-red-500 text-xs text-right">{error}</p>}
      {editing ? (
        <div className="flex flex-wrap items-end gap-2 justify-end">
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Price (₹)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={priceVal}
              onChange={(e) => setPriceVal(e.target.value)}
              autoFocus
              className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase text-slate-400 mb-0.5">Old (₹)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={priceOldVal}
              onChange={(e) => setPriceOldVal(e.target.value)}
              placeholder="—"
              className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={() => { if (!busy) savePrice(); }}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setError(null); }}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <button
            onClick={startEdit}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit price
          </button>
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
        </div>
      )}
      <button
        onClick={() => { if (confirm("Delete this course and all its content?")) run(() => deleteCourse(courseId)); }}
        disabled={busy}
        className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete course
      </button>
    </div>
  );
}
