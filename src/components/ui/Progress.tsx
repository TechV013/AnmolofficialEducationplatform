"use client";
import { cn } from "@/lib/utils";
export interface ProgressProps { value: number; max?: number; className?: string; label?: string; }
export default function Progress({ value, max = 100, className, label }: ProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn("w-full", className)}>
      {label && <div className="flex justify-between text-xs mb-1"><span>{label}</span><span>{Math.round(percent)}%</span></div>}
      <div className="w-full bg-soft-blue rounded-full h-2 overflow-hidden">
        <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}