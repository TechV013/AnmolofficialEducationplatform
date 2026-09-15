"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, List, FileText, Banknote, CreditCard, Award, MessageCircle, Settings } from "lucide-react";

export default function AdminNavMenu() {
  const pathname = usePathname();
  const routes = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/instructors", label: "Instructors", icon: Users },
    { href: "/admin/courses", label: "Courses", icon: List },
    { href: "/admin/enrollments", label: "Enrollments", icon: List },
    { href: "/admin/orders", label: "Orders", icon: Banknote },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/certificates", label: "Certificates", icon: Award },
    { href: "/admin/community", label: "Community", icon: MessageCircle },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];
  return (
    <aside className="w-64 border-r">
      <nav className="mt-6 space-y-2">
        {routes.map((route) => (
          <Link key={route.href} href={route.href} className={`flex items-center px-3 py-2 text-sm font-medium ${pathname === route.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}>
            <route.icon className="mr-3 h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}