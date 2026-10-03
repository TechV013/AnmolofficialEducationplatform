"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Quote, Play, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/data/courses";
import VideoReviewModal from "@/components/testimonials/VideoReviewModal";
import type { Testimonial } from "@/types/lms";

const PAGE_SIZE = 3;

export default function SuccessStories() {
  const [activeVideoTestimonial, setActiveVideoTestimonial] = useState<Testimonial | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const pages: (typeof testimonials)[] = [];
  for (let i = 0; i < testimonials.length; i += PAGE_SIZE) {
    pages.push(testimonials.slice(i, i + PAGE_SIZE));
  }
  const pageCount = pages.length;
  const current = pages[pageIndex % Math.max(1, pageCount)] ?? [];

  useEffect(() => {
    if (isPaused || pageCount <= 1) return;
    const timeout = setTimeout(() => {
      setPageIndex((prev) => (prev + 1) % pageCount);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [pageIndex, isPaused, pageCount]);

  const goNext = () => setPageIndex((prev) => (prev + 1) % pageCount);
  const goPrev = () =>
    setPageIndex((prev) => (prev - 1 + pageCount) % pageCount);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Student Feedback</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text">Their Stories. Their Success. Your Inspiration</h2>
          <p className="mt-3 text-sm sm:text-base text-muted max-w-xl mx-auto">
            See how our learners transformed their creative skills and built high-impact careers.
          </p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pageIndex}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              {current.map((t, i) => {
            const hasVideo = Boolean(t.videoUrl);

            return (
              <div
                key={t.id ?? i}
                className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-border overflow-hidden"
              >
                {/* Video Header Badge / Thumbnail if available */}
                {hasVideo ? (
                  <div
                    onClick={() => setActiveVideoTestimonial(t)}
                    className="relative mb-4 h-36 w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-[#172554] via-[#1E40AF] to-primary flex items-center justify-center group-hover:scale-[1.02] transition-transform shadow-inner"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveVideoTestimonial(t);
                      }
                    }}
                    aria-label={`Play video review by ${t.name}`}
                  >
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      <Video className="h-3 w-3 text-primary" />
                      <span>Video Review</span>
                    </div>

                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
                    </span>

                    <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Watch Story
                    </span>
                  </div>
                ) : (
                  <Quote className="w-6 h-6 text-primary/40 mb-4" />
                )}

                <p className="text-text leading-relaxed text-sm flex-1">&ldquo;{t.quote}&rdquo;</p>

                {t.courseTaken && (
                  <p className="mt-3 text-xs font-semibold text-primary/80">
                    Course: {t.courseTaken}
                  </p>
                )}

                <div className="mt-5 pt-5 border-t border-border flex items-center">
                  <div className="w-11 h-11 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg shrink-0">
                    {t.name[0]}
                  </div>
                  <div className="ml-3 min-w-0">
                    <h3 className="font-bold text-sm text-text truncate">{t.name}</h3>
                    <p className="text-xs text-muted truncate">{t.role}</p>
                  </div>
                  <div className="ml-auto flex shrink-0">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className={`w-3 h-3 ${j < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              );
            })}
            </motion.div>
          </AnimatePresence>

          {pageCount > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label="Previous testimonials"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full border border-gray-200 bg-white/90 p-2 shadow-md text-text hover:bg-white hover:shadow-lg transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Next testimonials"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full border border-gray-200 bg-white/90 p-2 shadow-md text-text hover:bg-white hover:shadow-lg transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/testimonials"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-dark text-dark px-8 py-3 text-base font-bold transition-all hover:bg-dark hover:text-white"
          >
            Explore All Student Reviews & Video Stories →
          </Link>
        </div>
      </div>

      {/* Video Modal */}
      <VideoReviewModal
        testimonial={activeVideoTestimonial}
        isOpen={Boolean(activeVideoTestimonial)}
        onClose={() => setActiveVideoTestimonial(null)}
      />
    </section>
  );
}
