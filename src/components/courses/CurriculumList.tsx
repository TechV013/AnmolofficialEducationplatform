"use client";
import { useState } from "react";
import { Play, Pencil, FileText, ChevronDown, Lock, CheckCircle2 } from "lucide-react";
import type { Module } from "@/types/lms";

export default function CurriculumList({ modules }: { modules: Module[] }) {
  const [openIds, setOpenIds] = useState<string[]>(modules.length > 0 ? [modules[0].id] : []);

  const toggle = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 text-center">
        <p className="text-sm text-muted">Curriculum is being prepared. Check back soon.</p>
      </div>
    );
  }

  const previewSeen: Record<string, boolean> = {};

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {[...modules]
        .sort((a, b) => a.position - b.position)
        .map((mod) => {
          const lessons = [...mod.lessons].sort((a, b) => a.position - b.position);
          const open = openIds.includes(mod.id);
          return (
            <div key={mod.id} className="border-b border-border last:border-b-0">
              <button
                onClick={() => toggle(mod.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-soft-blue/40"
                aria-expanded={open}
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text">
                    Module {mod.position}: {mod.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                  </p>
                </div>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="divide-y divide-slate-50 border-t border-border">
                  {lessons.map((lesson) => {
                    const isPreview = lesson.type === "video" && Boolean(lesson.videoUrl) && !previewSeen[mod.id];
                    previewSeen[mod.id] = true;
                    return (
                      <div key={lesson.id} className="flex items-center justify-between gap-4 px-5 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-soft-blue text-primary">
                            {lesson.type === "video" ? (
                              <Play className="h-3.5 w-3.5" fill="currentColor" />
                            ) : lesson.type === "resource" ? (
                              <FileText className="h-3.5 w-3.5" />
                            ) : (
                              <Pencil className="h-3.5 w-3.5" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-text">{lesson.title}</p>
                            <div className="flex items-center gap-2">
                              {isPreview && (
                                <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Preview</span>
                              )}
                              {lesson.resources.length > 0 && (
                                <span className="text-[10px] text-muted">{lesson.resources.length} resource{lesson.resources.length > 1 ? "s" : ""}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          {lesson.duration && <span className="text-xs text-muted">{lesson.duration}</span>}
                          <Lock className="h-3.5 w-3.5 text-slate-300" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      <div className="flex items-center gap-2 bg-soft-blue/50 px-5 py-3">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <p className="text-xs font-medium text-text">
          Everything is unlocked once you enroll — including assignments and PDF resources.
        </p>
      </div>
    </div>
  );
}