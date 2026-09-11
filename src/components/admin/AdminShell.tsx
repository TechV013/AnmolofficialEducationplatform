import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, UserCheck, ShoppingBag, CreditCard, MessageSquare, FileText, Award, HelpCircle } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Enrollments", href: "/admin/enrollments", icon: UserCheck },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { name: "Submissions", href: "/admin/submissions", icon: FileText },
  { name: "Quiz Attempts", href: "/admin/quiz-attempts", icon: HelpCircle },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-surface border-r border-border p-6 hidden md:block">
        <h2 className="text-xl font-bold text-text mb-8">Anmol Admin</h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="flex items-center gap-3 p-3 rounded-xl text-muted hover:bg-soft-blue hover:text-primary transition-colors">
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
