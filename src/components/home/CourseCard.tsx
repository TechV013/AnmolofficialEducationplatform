import Link from "next/link";
import { Course } from "@/types/lms";
import { Star, Clock, BookOpen } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="relative h-52 flex items-center justify-center bg-soft-blue">
        <div className="text-muted font-bold text-lg px-6 text-center">
          {course.title}
        </div>
        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
          {course.category}
        </span>
        <span className="absolute top-3 right-3 bg-dark text-white text-xs font-bold px-3 py-1 rounded-full">
          {course.isFree ? "FREE" : "PAID"}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 mt-3 text-sm text-muted">
          <span className="flex items-center gap-1"><Star className="w-4 h-4 text-primary fill-primary" /> {course.rating}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-primary" /> {course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-primary" /> {course.totalLessons} lessons</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-text">
            {course.isFree ? "Free" : `₹${course.price}`}
          </span>
          <Link
            href={`/courses/${course.id}`}
            className="bg-primary text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-primary-hover transition-colors"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
}
