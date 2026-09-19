"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Home, Users, GraduationCap, BookOpen, List, Banknote, CreditCard, Award, MessageCircle, Settings, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: Home }],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/students", label: "Students", icon: GraduationCap },
      { href: "/admin/instructors", label: "Instructors", icon: Users },
      { href: "/admin/courses", label: "Courses", icon: BookOpen },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/enrollments", label: "Enrollments", icon: List },
      { href: "/admin/orders", label: "Orders", icon: Banknote },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/community", label: "Community", icon: MessageCircle },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminNavMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | null;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/50 bg-white md:flex">
      <div className="flex items-center gap-2.5 border-b border-border/50 px-5 py-4">
        <Image src="/images/logo.png" alt="Anmolofficial" width={36} height={36} className="h-9 w-auto" />
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900">Anmolofficial</p>
          <p className="text-[11px] font-medium text-slate-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-slate-600 hover:bg-soft-blue/50 hover:text-slate-900"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/50 p-3">
        <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
            {(user?.name || "A").slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-slate-800">{user?.name || "Admin"}</p>
            <p className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
              <ShieldCheck className="h-3 w-3" /> Super Admin
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}