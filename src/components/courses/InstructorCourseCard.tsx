"use client";
import Link from "next/link";
import { BookOpen, Users, Star, Edit, Trash2, Eye, BarChart2 } from "lucide-react";

export default function InstructorCourseCard({ course, onDelete }: { course: any; onDelete: (id: string) => void }) {
  const isPublished = course.status === "PUBLISHED";

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        <div className="relative h-48 w-full bg-slate-100">
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isPublished ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {course.status}
            </span>
          </div>
        </div>
        <div className="p-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{course.category}</span>
          <h3 className="mt-1 text-lg font-bold text-text line-clamp-1">{course.title}</h3>
          <p className="mt-2 text-sm text-muted line-clamp-2">{course.description}</p>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              <span>{course.studentCount ?? 0} students</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>{course.modulesCount ?? 0} modules</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border p-4 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/instructor/courses/${course.id}`} className="p-2 rounded-lg bg-white border border-border text-text hover:bg-slate-100 transition-colors" title="Edit Course">
            <Edit className="h-4 w-4" />
          </Link>
          <Link href={`/instructor/courses/${course.id}/review`} className="p-2 rounded-lg bg-white border border-border text-text hover:bg-slate-100 transition-colors" title="Course Engagement">
            <BarChart2 className="h-4 w-4" />
          </Link>
          <Link href={`/courses/${course.id}`} target="_blank" className="p-2 rounded-lg bg-white border border-border text-text hover:bg-slate-100 transition-colors" title="View Public Page">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
        <button onClick={() => onDelete(course.id)} className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors" title="Delete Course">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
