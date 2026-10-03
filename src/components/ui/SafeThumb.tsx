"use client";
import { useState, ReactNode } from "react";

interface SafeThumbProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback: ReactNode;
}

export default function SafeThumb({ src, alt, className, fallback }: SafeThumbProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) return <>{fallback}</>;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
