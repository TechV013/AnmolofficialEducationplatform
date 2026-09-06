"use client";
import { courses, instructors } from "@/data/courses";
import Link from "next/link";
import { Star, Clock, BookOpen, Users, Play, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = courses.find((c) => c.id === courseId);
  const instructor = course?.instructorId ? instructors.find((i) => i.id === course.instructorId) : null;
  const [enrolled, setEnrolled] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link href="/courses" className="text-primary font-semibold hover:underline">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    localStorage.setItem("enrolled_courses", JSON.stringify([...JSON.parse(localStorage.getItem("enrolled_courses") || "[]"), course.id]));
    setEnrolled(true);
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/courses" className="text-primary font-semibold hover:underline flex items-center gap-1 mb-6">
          ← Back to Courses <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-200 rounded-2xl h-72 flex items-center justify-center text-gray-400 mb-6">
              Course Thumbnail
            </div>
            <h1 className="text-3xl font-bold text-black mb-4">{course.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-primary fill-primary" /> {course.rating}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> {course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-primary" /> {course.totalLessons} lessons</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> {course.students} students</span>
            </div>

            {instructor && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl mb-6 border">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold">
                  {instructor.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-sm">{instructor.name}</p>
                  <p className="text-xs text-gray-500">{instructor.role}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleEnroll}
              className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              {course.isFree ? "Start Learning" : enrolled ? "Continue Learning" : `Buy to Access - ₹${course.price}`}
            </button>
          </div>

          <div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-black mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {course.modules.map((mod, modIdx) => (
                  <div key={mod.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="bg-primary/5 p-4 font-bold text-sm text-primary flex items-center justify-between">
                      <span>Module {modIdx + 1}: {mod.title}</span>
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">{mod.lessons.length} lessons</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {mod.lessons.map((lesson) => (
                        <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                              <Play className="w-3 h-3" fill="currentColor" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{lesson.title}</p>
                              <p className="text-xs text-gray-400">{lesson.duration}</p>
                            </div>
                          </div>
                          {lesson.type === "assignment" && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Assignment</span>
                          )}
                          {lesson.type === "resource" && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Resource</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
