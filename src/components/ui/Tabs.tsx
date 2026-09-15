"use client";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: number;
  className?: string;
}

export default function Tabs({ items, defaultTab = 0, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={className}>
      <div className="flex gap-1 bg-soft-blue p-1 rounded-xl mb-4">
        {items.map((item, index) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(index)}
            className={cn(
              "flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors",
              activeTab === index ? "bg-white text-text shadow-sm" : "text-muted hover:text-text"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="animate-in fade-in duration-200">
        {items[activeTab]?.content}
      </div>
    </div>
  );
}
