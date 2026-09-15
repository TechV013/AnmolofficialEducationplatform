import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "success" | "warning" | "danger";
}

export default function Badge({ children, className, variant = "secondary" }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      variant === "primary" && "bg-primary text-white",
      variant === "secondary" && "bg-muted text-text/80",
      variant === "outline" && "border border-muted text-muted",
      variant === "success" && "bg-green-600 text-white",
      variant === "warning" && "bg-yellow-500 text-white",
      variant === "danger" && "bg-red-600 text-white",
      className
    )}
    >
      {children}
    </span>
  );
}
