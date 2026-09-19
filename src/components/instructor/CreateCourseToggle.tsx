"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import CourseForm from "./CourseForm";

export default function CreateCourseToggle() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        <Plus className="h-4 w-4" />
        {open ? "Close" : "New Course"}
      </button>
      {open && (
        <div className="mt-4">
          <CourseForm />
        </div>
      )}
    </div>
  );
}