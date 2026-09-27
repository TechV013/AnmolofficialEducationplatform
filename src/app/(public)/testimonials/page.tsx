"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, Quote, Play, Video, CheckCircle, Sparkles, Filter } from "lucide-react";
import { testimonials } from "@/data/courses";
import VideoReviewModal from "@/components/testimonials/VideoReviewModal";
import type { Testimonial } from "@/types/lms";

const CATEGORIES = ["All", "3D & Animation", "Rigging", "Video Editing"];

export default function TestimonialsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [videoOnly, setVideoOnly] = useState(false);
  const [activeVideoTestimonial, setActiveVideoTestimonial] = useState<Testimonial | null>(null);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const matchCat = selectedCategory === "All" || t.category === selectedCategory;
      const matchVideo = !videoOnly || Boolean(t.videoUrl);
      return matchCat && matchVideo;
    });
  }, [selectedCategory, videoOnly]);

  const totalReviews = testimonials.length;
  const videoReviewsCount = testimonials.filter((t) => Boolean(t.videoUrl)).length;
  const avgRating = (
    testimonials.reduce((acc, curr) => acc + curr.rating, 0) / (testimonials.length || 1)
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white border-b border-border py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-soft-blue border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Real Student Feedback & Outcomes</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text tracking-tight max-w-4xl mx-auto">
            Stories of Passion, Learning & Real Career Growth
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            Discover how students, freelancers, and creative artists master 3D, rigging, and video editing through purpose-driven mentorship.
          </p>

          {/* Social Proof Stats */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-background rounded-2xl p-4 border border-border">
              <p className="text-2xl sm:text-3xl font-bold text-text">{avgRating} ★</p>
              <p className="text-xs text-muted mt-1">Average Student Rating</p>
            </div>
            <div className="bg-background rounded-2xl p-4 border border-border">
              <p className="text-2xl sm:text-3xl font-bold text-text">91%</p>
              <p className="text-xs text-muted mt-1">Career Improvement Rate</p>
            </div>
            <div className="bg-background rounded-2xl p-4 border border-border">
              <p className="text-2xl sm:text-3xl font-bold text-text">{videoReviewsCount}</p>
              <p className="text-xs text-muted mt-1">Video Stories</p>
            </div>
            <div className="bg-background rounded-2xl p-4 border border-border">
              <p className="text-2xl sm:text-3xl font-bold text-text">2.3K+</p>
              <p className="text-xs text-muted mt-1">Learners Mentored</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Review Section & Filters */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white text-text border border-border hover:border-primary/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Toggle Video Only */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVideoOnly(!videoOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all border ${
                videoOnly
                  ? "bg-dark text-white border-dark"
                  : "bg-white text-text border-border hover:border-dark/50"
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Video Reviews Only ({videoReviewsCount})</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-border">
            <Quote className="h-12 w-12 text-muted/30 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-text">No reviews found in this category</h3>
            <p className="text-sm text-muted mt-1">Try selecting another topic filter above.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setVideoOnly(false);
              }}
              className="mt-4 px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((t, index) => {
              const hasVideo = Boolean(t.videoUrl);

              return (
                <div
                  key={t.id ?? index}
                  className="group relative flex flex-col justify-between bg-white rounded-3xl border border-border p-6 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div>
                    {/* Video Banner if has video */}
                    {hasVideo ? (
                      <div
                        onClick={() => setActiveVideoTestimonial(t)}
                        className="relative mb-5 aspect-video w-full cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#172554] via-[#1E40AF] to-primary flex items-center justify-center group-hover:scale-[1.02] transition-transform shadow-inner"
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
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          <Video className="h-3.5 w-3.5 text-primary" />
                          <span>Student Video</span>
                        </div>

                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-xl transition-transform group-hover:scale-110">
                          <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                        </span>

                        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                          Watch Story ▶
                        </span>
                      </div>
                    ) : (
                      <div className="mb-4 flex items-center justify-between">
                        <Quote className="h-7 w-7 text-primary/30" />
                        {t.category && (
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-soft-blue px-2.5 py-1 rounded-full">
                            {t.category}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rating stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-xs font-bold text-text">{t.rating}.0</span>
                    </div>

                    {/* Quote text */}
                    <p className="text-text text-sm sm:text-base leading-relaxed mb-4">
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    {t.courseTaken && (
                      <div className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Completed: {t.courseTaken}</span>
                      </div>
                    )}
                  </div>

                  {/* Student Profile Info */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-base">
                      {t.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-text truncate">{t.name}</h3>
                      <p className="text-xs text-muted truncate">{t.role}</p>
                    </div>
                    {hasVideo && (
                      <button
                        onClick={() => setActiveVideoTestimonial(t)}
                        className="text-xs font-bold text-primary hover:underline shrink-0"
                      >
                        Play Video
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-16 rounded-3xl bg-dark text-white p-8 sm:p-12 text-center relative overflow-hidden">
          <div aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative z-10">
            Ready to Build Your Creative Career?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-base sm:text-lg mb-8 relative z-10">
            Join hundreds of creative students learning industry-ready skills with step-by-step guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            <Link
              href="/courses"
              className="bg-primary text-white px-8 py-3.5 rounded-full font-bold text-base hover:bg-primary-hover transition-all shadow-lg hover:scale-105"
            >
              Explore All Courses
            </Link>
            <Link
              href="/register"
              className="bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-full font-bold text-base hover:bg-white/20 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Video Review Modal */}
      <VideoReviewModal
        testimonial={activeVideoTestimonial}
        isOpen={Boolean(activeVideoTestimonial)}
        onClose={() => setActiveVideoTestimonial(null)}
      />
    </div>
  );
}
