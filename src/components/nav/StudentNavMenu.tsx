"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ChartBar, ClipboardList, FileText, FileCheck, UserCircle, User } from "lucide-react";

export default function StudentNavMenu() {
  const pathname = usePathname();

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/my-learning", label: "My Learning", icon: BookOpen },
    { href: "/progress", label: "Progress", icon: ChartBar },
    { href: "/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/quizzes", label: "Quizzes", icon: FileCheck },
    { href: "/notes", label: "Notes", icon: FileText },
    { href: "/certificates", label: "Certificates", icon: UserCircle },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="w-64 bg-background border-r border-border h-full overflow-y-auto hidden md:block">
      <div className="p-4">
        <h2 className="font-bold text-lg mb-4">Student Menu</h2>
        <ul className="space-y-1">
          {routes.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === route.href ? "bg-primary/10 text-primary font-medium" : "text-text hover:bg-soft-blue/50"}`}
              >
                <route.icon className="w-4 h-4" />
                <span>{route.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}