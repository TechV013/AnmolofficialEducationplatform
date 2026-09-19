import Link from "next/link";
import { Course } from "@/types/lms";
import { Star, Clock, BookOpen, Box, Bone, Clapperboard } from "lucide-react";

interface CourseCardProps {
  course: Course;
}

interface CoverStyle {
  gradient: string;
  icon: typeof Box;
}

const coverStyles: Record<string, CoverStyle> = {
  "3D & Animation": { gradient: "from-[#172554] via-[#1E40AF] to-[#0069E0]", icon: Box },
  Rigging: { gradient: "from-[#181D27] via-[#2E1065] to-[#6D28D9]", icon: Bone },
  "Video Editing": { gradient: "from-[#500724] via-[#BE185D] to-[#F97316]", icon: Clapperboard },
};

const fallbackCover: CoverStyle = { gradient: "from-[#181D27] via-[#1E40AF] to-[#0069E0]", icon: BookOpen };

export default function CourseCard({ course }: CourseCardProps) {
  const cover = coverStyles[course.category] ?? fallbackCover;
  const CoverIcon = cover.icon;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`relative h-52 flex items-center justify-center bg-gradient-to-br ${cover.gradient}`}>
        <CoverIcon className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 group-hover:text-white/15 transition-all duration-500" />
        <span className="relative z-10 text-white font-bold text-lg px-6 text-center drop-shadow-sm">
          {course.title}
        </span>
        <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
          {course.category}
        </span>
        <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20">
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
