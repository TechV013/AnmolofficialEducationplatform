"use client";
import { useState } from "react";
import { Play, Box } from "lucide-react";

interface HeroMediaProps {
  thumbnail?: string;
  title: string;
  category: string;
}

export default function HeroMedia({ thumbnail, title, category }: HeroMediaProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(thumbnail) && !imgError;

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
        title={`Video preview for ${category} — coming soon`}
        aria-label={`Play preview for ${title}`}
        className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/25 transition-colors hover:bg-black/15"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-xl transition-transform hover:scale-110">
          <Play className="ml-0.5 h-7 w-7" fill="currentColor" />
        </span>
      </button>
    </div>
  );
}