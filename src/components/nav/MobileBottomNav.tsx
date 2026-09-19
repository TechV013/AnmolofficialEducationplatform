"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  BookOpen,
  Users,
  Settings,
  GraduationCap,
  ClipboardList,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Panel = "admin" | "instructor" | "student";

interface Item {
  href: string;
  label: string;
  icon: typeof HomeIcon;
  match: (pathname: string) => boolean;
}

const CONFIGS: Record<Panel, Item[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: HomeIcon, match: (p) => p === "/admin" },
    { href: "/admin/courses", label: "Courses", icon: BookOpen, match: (p) => p.startsWith("/admin/courses") },
    { href: "/admin/users", label: "Users", icon: Users, match: (p) => p.startsWith("/admin/users") || p.startsWith("/admin/students") || p.startsWith("/admin/instructors") },
    { href: "/admin/settings", label: "Settings", icon: Settings, match: (p) => p.startsWith("/admin/settings") },
  ],
  instructor: [
    { href: "/instructor", label: "Dashboard", icon: HomeIcon, match: (p) => p === "/instructor" },
    { href: "/instructor/courses", label: "Courses", icon: BookOpen, match: (p) => p.startsWith("/instructor/courses") },
    { href: "/instructor/students", label: "Students", icon: GraduationCap, match: (p) => p.startsWith("/instructor/students") },
    { href: "/instructor/profile", label: "Profile", icon: User, match: (p) => p.startsWith("/instructor/profile") },
  ],
  student: [
    { href: "/dashboard", label: "Dashboard", icon: HomeIcon, match: (p) => p === "/dashboard" },
    { href: "/my-learning", label: "Learning", icon: BookOpen, match: (p) => p === "/my-learning" || p.startsWith("/progress") },
    { href: "/assignments", label: "Tasks", icon: ClipboardList, match: (p) => p === "/assignments" || p.startsWith("/quizzes") || p.startsWith("/notes") },
    { href: "/profile", label: "Profile", icon: User, match: (p) => p.startsWith("/profile") },
  ],
};

export default function MobileBottomNav({ panel }: { panel: Panel }) {
  const pathname = usePathname();
  const items = CONFIGS[panel];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-white/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 pt-2.5 pb-1.5 text-[10px] font-semibold transition-colors",
                active ? "text-primary" : "text-slate-500 hover:text-slate-800"
              )}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}