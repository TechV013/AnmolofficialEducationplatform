"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-bold rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
        variant === "primary" && "bg-primary text-white hover:bg-primary-hover shadow-sm",
        variant === "secondary" && "bg-dark text-white hover:bg-[#111] shadow-sm",
        variant === "outline" && "border-2 border-dark text-dark hover:bg-dark hover:text-white",
        variant === "ghost" && "text-text hover:bg-soft-blue",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-6 py-2.5 text-base",
        size === "lg" && "px-8 py-3.5 text-lg",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
