"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Users, MessageSquare, User } from "lucide-react";

export default function InstructorNavMenu() {
  const pathname = usePathname();
  const baseRoutes = [
    { href: "/instructor", label: "Dashboard", icon: Home },
    { href: "/instructor/courses", label: "Courses", icon: BookOpen },
    { href: "/instructor/students", label: "Students", icon: Users },
    { href: "/instructor/reviews", label: "Reviews", icon: MessageSquare },
    { href: "/instructor/profile", label: "Profile", icon: User },
  ];
  const courseMatch = pathname.match(/^\/instructor\/courses\/([^\/]+)/);
  let courseRoutes: { href: string; label: string; icon: typeof Home }[] = [];
  if (courseMatch) {
    const courseId = courseMatch[1];
    courseRoutes = [
      { href: `/instructor/courses/${courseId}`, label: "Overview", icon: Home },
    ];
  }
  return (
    <aside className="w-64 border-r">
      <nav className="mt-6 space-y-2">
        {baseRoutes.map((route) => (
          <Link key={route.href} href={route.href} className={`flex items-center px-3 py-2 text-sm font-medium ${pathname === route.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            <route.icon className="mr-3 h-4 w-4" />
            {route.label}
          </Link>
        ))}
        {courseRoutes.length > 0 && (
          <>
            <hr className="my-4" />
            <nav className="mt-4 space-y-2">
              {courseRoutes.map((route) => (
                <Link key={route.href} href={route.href} className={`flex items-center px-3 py-2 text-sm font-medium ${pathname === route.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
                  <route.icon className="mr-3 h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </nav>
          </>
        )}
      </nav>
    </aside>
  );
}