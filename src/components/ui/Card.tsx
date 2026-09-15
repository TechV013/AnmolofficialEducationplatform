import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function Card({ children, className, title, subtitle }: CardProps) {
  return (
    <div className={cn("bg-surface rounded-2xl border border-border shadow-sm overflow-hidden", className)}>
      {(title || subtitle) && (
        <div className="p-6 pb-2 border-b border-border">
          {title && <h3 className="text-xl font-bold text-text">{title}</h3>}
          {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
