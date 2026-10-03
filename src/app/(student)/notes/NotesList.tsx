"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, FileText } from "lucide-react";

interface NoteItem {
  id: string;
  content: string;
  updatedAt: string;
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
}

function excerpt(content: string) {
  const trimmed = content.trim();
  if (trimmed.length <= 240) return trimmed;
  return trimmed.slice(0, 240).trimEnd() + "…";
}

export default function NotesList({ notes }: { notes: NoteItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.courseTitle.toLowerCase().includes(q) ||
        n.lessonTitle.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, query]);

  if (notes.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <span className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
          <FileText className="h-6 w-6" />
        </span>
        <p className="mb-2 font-semibold text-slate-800">No notes yet</p>
        <p className="mb-6 text-sm text-slate-500">
          Open any lesson and write in the Notes panel — your notes will be collected here.
        </p>
        <Link href="/my-learning" className="inline-block rounded-full bg-primary px-6 py-3 font-bold text-white hover:bg-primary-hover transition-colors">
          Go to My Learning
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by course, lesson or text…"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
          No notes match &quot;{query.trim()}&quot;.
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((n) => (
            <li key={n.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link href={`/classroom/${n.courseId}/${n.lessonId}`} className="min-w-0 font-medium text-slate-900 hover:text-primary">
                  {n.courseTitle} — {n.lessonTitle}
                </Link>
                <span className="text-xs text-slate-400">Edited {new Date(n.updatedAt).toLocaleString()}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{excerpt(n.content)}</p>
              <div className="mt-3 flex justify-end">
                <Link href={`/classroom/${n.courseId}/${n.lessonId}`} className="text-xs font-semibold text-primary hover:underline">
                  Open lesson →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-slate-400">
        {filtered.length} of {notes.length} notes
      </p>
    </div>
  );
}
