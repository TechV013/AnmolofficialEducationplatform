import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface EmptyStateProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
}

export default function EmptyState({ children, className, title, subtitle, icon }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      {title && <h3 className="text-xl font-bold text-text mb-2">{title}</h3>}
      {subtitle && <p className="text-sm text-muted mb-4">{subtitle}</p>}
      {children && <div className="text-sm text-muted">{children}</div>}
    </div>
  );
}
