"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface SkeletonProps {
  children?: ReactNode;
  className?: string;
  height?: string | number;
  width?: string | number;
}

export default function Skeleton({ children, className, height, width }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/50 rounded-xl",
        height !== undefined && (typeof height === "number" ? `h-${height}` : `h-${height}`),
        width !== undefined && (typeof width === "number" ? `w-${width}` : `w-${width}`),
        className
      )}
    >
      {children}
    </div>
  );
}
