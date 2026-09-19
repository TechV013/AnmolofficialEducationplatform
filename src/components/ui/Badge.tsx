import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "success" | "warning" | "danger" | "info";
}

const variants: Record<string, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-slate-100 text-slate-600",
  outline: "border border-slate-300 text-slate-600",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export default function Badge({ children, className, variant = "secondary" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variants[variant],
      className
    )}
    >
      {children}
    </span>
  );
}