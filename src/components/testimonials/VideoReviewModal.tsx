"use client";
import { useEffect } from "react";
import { X, Star, GraduationCap } from "lucide-react";
import VideoPlayer from "@/components/video/VideoPlayer";
import type { Testimonial } from "@/types/lms";

interface VideoReviewModalProps {
  testimonial: Testimonial | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoReviewModal({ testimonial, isOpen, onClose }: VideoReviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !testimonial || !testimonial.videoUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Student review by ${testimonial.name}`}
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#111111] text-white shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar with close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white text-base">
              {testimonial.name[0]}
            </div>
            <div>
              <p className="font-bold text-sm text-white leading-tight">{testimonial.name}</p>
              <p className="text-xs text-white/60">{testimonial.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close video player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="aspect-video w-full bg-black">
          <VideoPlayer
            url={testimonial.videoUrl}
            title={`${testimonial.name}'s Student Review`}
            mode="preview"
          />
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-white/[0.03]">
          {testimonial.courseTaken && (
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
              <GraduationCap className="h-4 w-4" />
              <span>Completed: {testimonial.courseTaken}</span>
            </div>
          )}
          <p className="text-sm text-white/80 italic leading-relaxed">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-white/20"}`}
              />
            ))}
            <span className="ml-2 text-xs font-bold text-white/70">
              {testimonial.rating}.0 / 5.0 Rating
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
