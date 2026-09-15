"use client";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
export interface TooltipProps { children: ReactNode; content: ReactNode; className?: string; }
export default function Tooltip({ children, content, className }: TooltipProps) {
  return (
    <div className={cn("relative group inline-block", className)}>
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-dark text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        {content}
      </div>
    </div>
  );
}