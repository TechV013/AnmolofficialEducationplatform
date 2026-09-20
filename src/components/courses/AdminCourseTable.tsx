"use client";
import { useState } from "react";
import { Users, Shield, Trash2, CheckCircle } from "lucide-react";

export default function AdminCourseTable({ courses, users, onDeleteCourse, onPromoteUser }: { courses: any[]; users: any[]; onDeleteCourse: (id: string) => void; onPromoteUser: (id: string) => void }) {
  const [tab, setTab] = useState<"courses" | "users">("courses");

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border pb-4">
        <button onClick={() => setTab("courses")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "courses" ? "bg-primary text-white" : "bg-soft-blue text-text"}`}>
          Manage Courses ({courses.length})
        </button>
        <button onClick={() => setTab("users")} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === "users" ? "bg-primary text-white" : "bg-soft-blue text-text"}`}>
          Manage Users ({users.length})
        </button>
      </div>

      {tab === "courses" ? (
        <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-xs font-bold uppercase text-muted">
                <th className="p-4">Course Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {courses.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-text">{c.title}</td>
                  <td className="p-4 text-muted">{c.category}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${c.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-text">₹{c.price}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => onDeleteCourse(c.id)} className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-slate-50 text-xs font-bold uppercase text-muted">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-text">{u.name || "N/A"}</td>
                  <td className="p-4 text-muted">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : u.role === "INSTRUCTOR" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== "INSTRUCTOR" && u.role !== "ADMIN" && (
                      <button onClick={() => onPromoteUser(u.id)} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors">
                        Promote to Instructor
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
