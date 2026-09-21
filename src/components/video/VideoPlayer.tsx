"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEmbedUrl, getEmbedUrlWithResume, type MediaType } from "@/lib/video/getEmbedUrl";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const CONTROLS_HIDE_DELAY = 3000;

interface VideoPlayerProps {
  url: string;
  title: string;
  mode: "preview" | "classroom";
  savedPosition?: number;
  onTimeUpdate?: (seconds: number) => void;
  onEnded?: () => void;
  onError?: (message: string) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoPlayer({
  url,
  title,
  mode,
  savedPosition = 0,
  onTimeUpdate,
  onEnded,
  onError,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [hasResumed, setHasResumed] = useState(false);

  const mediaInfo = mode === "classroom" && savedPosition > 0
    ? getEmbedUrlWithResume(url, savedPosition)
    : getEmbedUrl(url);
  const isHtml5 = mediaInfo.type === "html5";

  const hideControls = useCallback(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), CONTROLS_HIDE_DELAY);
    }
  }, [isPlaying]);

  const showControlsNow = useCallback(() => {
    setShowControls(true);
    hideControls();
  }, [hideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isHtml5) return;

    const onTimeUpdateHandler = () => {
      setCurrentTime(video.currentTime);
      if (mode === "classroom" && onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onPlayHandler = () => setIsPlaying(true);
    const onPauseHandler = () => { setIsPlaying(false); setShowControls(true); };
    const onEndedHandler = () => { setIsPlaying(false); setShowControls(true); onEnded?.(); };
    const onErrorHandler = () => setVideoError("Video unavailable. The file may be corrupted or the format is not supported.");

    video.addEventListener("timeupdate", onTimeUpdateHandler);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("play", onPlayHandler);
    video.addEventListener("pause", onPauseHandler);
    video.addEventListener("ended", onEndedHandler);
    video.addEventListener("error", onErrorHandler);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdateHandler);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("play", onPlayHandler);
      video.removeEventListener("pause", onPauseHandler);
      video.removeEventListener("ended", onEndedHandler);
      video.removeEventListener("error", onErrorHandler);
    };
  }, [isHtml5, mode, onTimeUpdate, onEnded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isHtml5 || hasResumed) return;
    if (savedPosition > 0) {
      video.currentTime = savedPosition;
      setHasResumed(true);
    }
  }, [isHtml5, savedPosition, hasResumed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    if (!isHtml5 || mode !== "classroom") return;
    saveTimerRef.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
    }, 30000);
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
  }, [isHtml5, mode, onTimeUpdate]);

  useEffect(() => {
    if (mode === "preview" || !isHtml5) return;
    const handler = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          showControlsNow();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          showControlsNow();
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          showControlsNow();
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          setIsMuted(false);
          showControlsNow();
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          showControlsNow();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case ",":
          e.preventDefault();
          setSpeed(prev => { const idx = SPEED_OPTIONS.indexOf(prev); return idx > 0 ? SPEED_OPTIONS[idx - 1] : prev; });
          showControlsNow();
          break;
        case ".":
          e.preventDefault();
          setSpeed(prev => { const idx = SPEED_OPTIONS.indexOf(prev); return idx < SPEED_OPTIONS.length - 1 ? SPEED_OPTIONS[idx + 1] : prev; });
          showControlsNow();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, isHtml5, showControlsNow]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => { hideControls(); }, [isPlaying, hideControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
    showControlsNow();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    showControlsNow();
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await container.requestFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
    showControlsNow();
  };

  const handleVideoClick = () => {
    if (mode === "preview") {
      togglePlay();
    } else {
      showControlsNow();
    }
  };

  const handleRetry = () => {
    setVideoError(null);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {});
    }
  };

  if (videoError) {
    return (
      <div className="bg-black aspect-video w-full rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center p-6 space-y-3">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <p className="text-sm font-semibold text-white">{videoError}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={handleRetry} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="bg-black aspect-video w-full rounded-2xl overflow-hidden flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-lg font-bold text-white">Video unavailable</p>
          <p className="text-sm text-gray-400 mt-1">This lesson does not yet have a video assigned.</p>
        </div>
      </div>
    );
  }

  if (!isHtml5) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={mediaInfo.embedUrl}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg group"
      onMouseMove={showControlsNow}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        playsInline
        onClick={handleVideoClick}
      />

      {mode === "classroom" && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 px-4 pb-3 pt-10",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />}
              </button>

              <button onClick={toggleMute} className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (videoRef.current) videoRef.current.volume = v;
                  setIsMuted(v === 0);
                }}
                className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />

              <span className="text-xs text-white/80 font-mono tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2 py-1 rounded-lg text-white text-xs font-bold hover:bg-white/20 transition-colors"
                >
                  {speed}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-1 bg-black/90 rounded-xl p-1 shadow-xl">
                    {SPEED_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}
                        className={cn(
                          "block w-full px-3 py-1.5 text-xs font-bold rounded-lg text-left transition-colors",
                          speed === s ? "bg-white text-black" : "text-white hover:bg-white/20"
                        )}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="p-1.5 rounded-lg text-white hover:bg-white/20 transition-colors">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "preview" && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity",
            isPlaying ? "opacity-0 hover:opacity-100" : ""
          )}
        >
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-xl transition-transform hover:scale-110"
            >
              <Play className="ml-0.5 h-7 w-7" fill="currentColor" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
