"use client";
import { useState } from "react";
import { Play, Box, X } from "lucide-react";

interface HeroMediaProps {
  thumbnail?: string;
  title: string;
  category: string;
  promoVideoUrl?: string | null;
}

export default function HeroMedia({ thumbnail, title, category, promoVideoUrl }: HeroMediaProps) {
  const [imgError, setImgError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const showImage = Boolean(thumbnail) && !imgError;

  if (isPlaying && promoVideoUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
        <video
          src={promoVideoUrl}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
        <button
          onClick={() => setIsPlaying(false)}
          className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition-colors hover:bg-black/90"
        >
          <X className="h-4 w-4" />
          <span>Close Preview</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#172554] via-[#1E40AF] to-primary shadow-lg">
      {showImage ? (
        <img
          src={thumbnail as string}
          alt={title}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Box className="h-16 w-16 text-white/20" />
          <span className="sr-only">{title}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (promoVideoUrl) {
            setIsPlaying(true);
          } else {
            alert("No preview video uploaded for this course yet. Instructors can upload a preview video in course settings.");
          }
        }}
        title={promoVideoUrl ? `Play preview video` : `No video preview available`}
        aria-label={`Play preview for ${title}`}
        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/25 transition-colors hover:bg-black/15"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-xl transition-transform hover:scale-110">
          <Play className="ml-0.5 h-7 w-7" fill="currentColor" />
        </span>
      </button>

      {promoVideoUrl && (
        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          ▶ Watch Preview Video
        </div>
      )}
    </div>
  );
}
