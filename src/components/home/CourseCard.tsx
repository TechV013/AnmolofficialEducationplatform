import Link from "next/link";
import { Course } from "@/types/lms";
import { Star, Clock, BookOpen } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  // Map categories to specific placeholder colors/gradients for a professional look
  const getThumbnailStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case "3d & animation":
        return "bg-gradient-to-br from-indigo-500 to-purple-600";
      case "rigging":
        return "bg-gradient-to-br from-emerald-500 to-teal-600";
      case "video editing":
        return "bg-gradient-to-br from-rose-500 to-orange-500";
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`relative h-52 flex items-center justify-center ${getThumbnailStyle(course.category)}`}>
        <div className="text-white/80 font-bold text-lg px-6 text-center">
          {course.title}
        </div>
        <span className="absolute top-3 left-3 bg-[#0069E0] text-white text-xs font-bold px-3 py-1 rounded-full">
          {course.category}
        </span>
        <span className="absolute top-3 right-3 bg-[#111111] text-white text-xs font-bold px-3 py-1 rounded-full">
          {course.isFree ? "FREE" : "PAID"}
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-[#181D27] group-hover:text-[#0069E0] transition-colors line-clamp-2">
          {course.title}
        </h3>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Star className="w-4 h-4 text-[#0069E0] fill-[#0069E0]" /> {course.rating}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-[#0069E0]" /> {course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-[#0069E0]" /> {course.totalLessons} lessons</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-[#111111]">
            {course.isFree ? "Free" : `₹${course.price}`}
          </span>
          <Link
            href={`/courses/${course.id}`}
            className="bg-[#0069E0] text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-[#0055B3] transition-colors"
          >
            Buy to access
          </Link>
        </div>
      </div>
    </div>
  );
}
