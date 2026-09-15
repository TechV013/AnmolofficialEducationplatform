"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem { label: string; href?: string; }
export interface BreadcrumbProps { items: BreadcrumbItem[]; className?: string; }
export default function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2 text-sm text-muted">
        {items.map((item, index) => (
          <li key={item.label + index} className="flex items-center space-x-2">
            {index > 0 && <ChevronRight className="w-4 h-4" />}
            {item.href ? <Link href={item.href} className="hover:text-primary transition-colors">{item.label}</Link> : <span className="text-text font-medium">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}