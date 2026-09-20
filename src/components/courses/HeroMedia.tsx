"use client";
import { useState } from "react";
import { Play, Box, X, AlertCircle } from "lucide-react";

interface HeroMediaProps {
  thumbnail?: string;
  title: string;
  category: string;
  promoVideoUrl?: string | null;
}

function getEmbedUrl(url: string): { type: "youtube" | "vimeo" | "html5"; embedUrl: string } {
  if (!url) return { type: "html5", embedUrl: "" };

  // YouTube match
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { type: "youtube", embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  }

  // Vimeo match
  const vimeoMatch = url.match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: "vimeo", embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }

  return { type: "html5", embedUrl: url };
}

export default function HeroMedia({ thumbnail, title, category, promoVideoUrl }: HeroMediaProps) {
  const [imgError, setImgError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const showImage = Boolean(thumbnail) && !imgError;

  const mediaInfo = getEmbedUrl(promoVideoUrl || "");

  if (isPlaying && promoVideoUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg flex items-center justify-center">
        {mediaInfo.type === "youtube" || mediaInfo.type === "vimeo" ? (
          <iframe
            src={mediaInfo.embedUrl}
            title={title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : videoError ? (
          <div className="p-6 text-center text-white space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold">Video failed to load or unsupported format.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please use a YouTube link, Vimeo link, or direct MP4 video URL in course settings.
            </p>
            <button
              onClick={() => { setVideoError(false); setIsPlaying(false); }}
              className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold"
            >
              Back to Thumbnail
            </button>
          </div>
        ) : (
          <video
            src={promoVideoUrl}
            controls
            autoPlay
            playsInline
            onError={() => setVideoError(true)}
            className="h-full w-full object-contain"
          />
        )}
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
            setVideoError(false);
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
