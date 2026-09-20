"use client";
import { useState, type ReactNode } from "react";

const TABS = [
  { id: "about", label: "About" },
  { id: "curriculum", label: "Curriculum" },
  { id: "reviews", label: "Reviews" }
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function CourseTabs({ about, curriculum, reviews }: {
  about: ReactNode;
  curriculum: ReactNode;
  reviews: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("about");

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-1 overflow-x-auto border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex min-w-max gap-6 px-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`relative -mb-px border-b-2 px-1 pb-3 pt-4 text-sm font-bold transition-colors ${
                active === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="py-8">
        {active === "about" && about}
        {active === "curriculum" && curriculum}
        {active === "reviews" && reviews}
      </div>
    </div>
  );
}