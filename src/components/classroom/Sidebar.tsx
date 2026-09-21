"use client";
import { useState } from "react";
import Link from "next/link";
import { Module } from "@/types/lms";
import { cn } from "@/lib/utils";
import { ChevronDown, Play, FileText, HelpCircle, CheckCircle2 } from "lucide-react";
import Progress from "@/components/ui/Progress";

interface SidebarProps {
  courseId: string;
  lessonId: string;
  modules: Module[];
  progressMap: Record<string, { completed: boolean; watchedSeconds: number }>;
}

function getLessonIcon(type: string) {
  switch (type) {
    case "video": return <Play className="h-3.5 w-3.5" />;
    case "assignment": return <FileText className="h-3.5 w-3.5" />;
    case "resource": return <FileText className="h-3.5 w-3.5" />;
    default: return <Play className="h-3.5 w-3.5" />;
  }
}

export default function Sidebar({ courseId, lessonId, modules, progressMap }: SidebarProps) {
  const sortedModules = [...modules].sort((a, b) => a.position - b.position);
  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    const first = sortedModules[0];
    return first ? new Set([first.id]) : new Set();
  });

  const totalLessons = sortedModules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = Object.values(progressMap).filter(p => p.completed).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const toggleModule = (id: string) => {
    setOpenModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  let lessonCounter = 0;

  return (
    <div className="w-80 bg-surface border-r border-border h-screen overflow-y-auto flex flex-col">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-bold text-text mb-3">Course Content</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{completedLessons} of {totalLessons} lessons</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {sortedModules.map((module) => {
          const isOpen = openModules.has(module.id);
          const moduleLessons = [...module.lessons].sort((a, b) => a.position - b.position);
          const moduleCompleted = moduleLessons.every(l => progressMap[l.id]?.completed);

          return (
            <div key={module.id} className="rounded-xl overflow-hidden">
              <button
                onClick={() => toggleModule(module.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold transition-colors",
                  isOpen ? "bg-white text-text" : "text-muted hover:bg-white/50"
                )}
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isOpen ? "rotate-0" : "-rotate-90"
                  )}
                />
                <span className="flex-1 truncate">{module.title}</span>
                {moduleCompleted && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                )}
              </button>

              {isOpen && (
                <ul className="pb-1">
                  {moduleLessons.map((lesson) => {
                    lessonCounter++;
                    const isActive = lesson.id === lessonId;
                    const isCompleted = progressMap[lesson.id]?.completed || false;

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/classroom/${courseId}/${lesson.id}`}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 ml-4 text-sm rounded-lg transition-colors",
                            isActive
                              ? "bg-soft-blue text-primary font-medium border-l-2 border-primary"
                              : "text-text hover:bg-soft-blue/50"
                          )}
                        >
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-muted shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              lessonCounter
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm">{lesson.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1 text-[10px] text-muted">
                                {getLessonIcon(lesson.type)}
                                {lesson.type}
                              </span>
                              {lesson.duration && (
                                <span className="text-[10px] text-muted">{lesson.duration}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
