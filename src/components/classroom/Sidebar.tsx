import Link from "next/link";
import { Module } from "@/types/lms";
import { cn } from "@/lib/utils";

export default function Sidebar({ courseId, lessonId, modules }: { courseId: string; lessonId: string; modules: Module[] }) {
  return (
    <div className="w-80 bg-surface border-r border-border h-screen overflow-y-auto p-6 hidden lg:block">
      <h2 className="text-xl font-bold text-text mb-6">Course Content</h2>
      {modules.sort((a,b) => a.position - b.position).map((module) => (
        <div key={module.id} className="mb-6">
          <h3 className="font-semibold text-muted mb-3">{module.title}</h3>
          <ul className="space-y-2">
            {module.lessons.sort((a,b) => a.position - b.position).map((lesson) => (
              <li key={lesson.id}>
                <Link 
                  href={`/classroom/${courseId}/${lesson.id}`}
                  className={cn(
                      "block p-3 rounded-lg text-sm transition-colors",
                      lesson.id === lessonId ? "bg-soft-blue text-primary font-medium" : "text-text hover:bg-soft-blue/50"
                  )}
                >
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
