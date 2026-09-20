"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DURATION_PRESETS } from "@/lib/course-filters";

interface CourseFiltersProps {
  isStudent: boolean;
  categories: string[];
  initial: {
    tab: string;
    category: string | null;
    freeOnly: boolean;
    duration: string | null;
  };
}

export default function CourseFilters({ isStudent, categories, initial }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "" || value === "all") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `/courses?${qs}` : "/courses", { scroll: false });
    },
    [router, searchParams]
  );

  const clearAll = () => router.push("/courses");
  const activeTab = initial.tab;

  return (
    <div className="space-y-4">
      {isStudent && (
        <div className="flex flex-wrap items-center gap-2">
          {([
            { id: "all", label: "All Courses" },
            { id: "inprogress", label: "In Progress" },
            { id: "completed", label: "Completed" }
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => update({ tab: t.id === "all" ? null : t.id })}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeTab === t.id || (activeTab === "all" && t.id === "all")
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border border-border text-text hover:bg-soft-blue"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => update({ category: null })}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            !initial.category
              ? "bg-dark text-white"
              : "bg-white border border-border text-muted hover:bg-soft-blue"
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => update({ category: cat })}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              initial.category === cat
                ? "bg-dark text-white"
                : "bg-white border border-border text-muted hover:bg-soft-blue"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => update({ free: initial.freeOnly ? null : "1" })}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
            initial.freeOnly
              ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
              : "bg-white border border-border text-muted hover:bg-soft-blue"
          }`}
        >
          {initial.freeOnly ? "✓ Free Only" : "Free Only"}
        </button>

        <select
          value={initial.duration ?? ""}
          onChange={(e) => update({ duration: e.target.value || null })}
          className="text-xs font-bold px-4 py-2 rounded-full bg-white border border-border text-muted outline-none focus:border-primary"
        >
          <option value="">Any Duration</option>
          {DURATION_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        {initial.freeOnly || initial.category || initial.duration ? (
          <button onClick={clearAll} className="text-xs font-semibold text-primary hover:underline">
            Clear all
          </button>
        ) : null}
      </div>
    </div>
  );
}