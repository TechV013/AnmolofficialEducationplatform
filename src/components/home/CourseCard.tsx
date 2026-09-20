import Link from "next/link";
import { Course } from "@/types/lms";
import { Star, Clock, BookOpen, Box, Bone, Clapperboard, GraduationCap } from "lucide-react";
import { formatPrice, discountPercent } from "@/lib/course-stats";

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
  Design: { gradient: "from-[#064E3B] via-[#0F766E] to-[#0069E0]", icon: GraduationCap },
  "Web Development": { gradient: "from-[#0C4A6E] via-[#0369A1] to-[#0069E0]", icon: GraduationCap },
};

const fallbackCover: CoverStyle = { gradient: "from-[#181D27] via-[#1E40AF] to-[#0069E0]", icon: BookOpen };

const levelBadge: Record<string, string> = {
  Beginner: "bg-emerald-500/90",
  Intermediate: "bg-amber-500/90",
  Advanced: "bg-rose-500/90",
};

export default function CourseCard({ course }: CourseCardProps) {
  const cover = coverStyles[course.category] ?? fallbackCover;
  const CoverIcon = cover.icon;
  const discount = discountPercent(course.price, course.priceOld);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
      <Link
        href={`/courses/${course.id}`}
        className={`relative h-40 flex items-center justify-center bg-gradient-to-br ${cover.gradient} overflow-hidden`}
      >
        <CoverIcon className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10 group-hover:scale-110 group-hover:text-white/15 transition-all duration-500" />
        <span className="relative z-10 text-white font-bold text-lg px-6 text-center drop-shadow-sm line-clamp-2">
          {course.title}
        </span>
        <span className={`absolute top-3 left-3 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/30 ${levelBadge[course.level] ?? "bg-white/20"}`}>
          {course.level}
        </span>
        <span
          className={`absolute top-3 right-3 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 ${
            course.isFree ? "bg-emerald-500/80" : "bg-black/40"
          }`}
        >
          {course.isFree ? "FREE" : "PAID"}
        </span>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">{course.category}</p>
        <h3 className="mt-1.5 text-base font-bold text-text group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="mt-1 text-xs text-muted">
          By <span className="font-semibold">{course.instructorName}</span>
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 mb-4 text-xs text-muted">
          <span className="flex items-center gap-1 font-semibold text-text">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
            {course.rating || "New"}
            {course.reviewsCount > 0 && <span className="font-normal text-muted">({course.reviewsCount})</span>}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-primary" /> {course.totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-primary" /> {course.duration}
          </span>
        </div>

        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div>
            {course.isFree ? (
              <span className="text-xl font-bold text-text">Free</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-text">{formatPrice(course.price)}</span>
                {course.priceOld ? (
                  <>
                    <span className="text-sm text-muted line-through">{formatPrice(course.priceOld)}</span>
                    {discount != null && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        {discount}% off
                      </span>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
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