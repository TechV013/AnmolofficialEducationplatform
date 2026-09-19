"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, ChevronRight, Home } from "lucide-react";

interface WorkspaceHeaderProps {
  title?: string;
  user?: { name?: string; email?: string; role?: string } | null;
}

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  instructor: "Instructor",
  dashboard: "Student",
  users: "Users",
  students: "Students",
  instructors: "Instructors",
  courses: "Courses",
  enrollments: "Enrollments",
  orders: "Orders",
  payments: "Payments",
  certificates: "Certificates",
  community: "Community",
  settings: "Settings",
  "my-learning": "My Learning",
  progress: "Progress",
  assignments: "Assignments",
  quizzes: "Quizzes",
  notes: "Notes",
  profile: "Profile",
  reviews: "Reviews",
  classroom: "Classroom",
  category: "Category",
};

function initials(name?: string) {
  if (!name) return "A";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleColor(role?: string) {
  switch (role) {
    case "ADMIN":
      return "bg-amber-100 text-amber-700";
    case "INSTRUCTOR":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

export default function WorkspaceHeader({ title = "Anmolofficial", user }: WorkspaceHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs =
    segments.length <= 1
      ? []
      : segments.slice(0, -1).map((seg) => SEGMENT_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1));
  const current = SEGMENT_LABELS[segments[segments.length - 1]] || title;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/50 bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/images/logo.png" alt="Anmolofficial" width={40} height={40} className="h-9 w-auto" />
          <span className="hidden text-lg font-bold tracking-tight text-primary sm:block">Anmolofficial</span>
        </Link>
        <nav className="hidden items-center gap-1.5 text-sm text-slate-500 md:flex" aria-label="Breadcrumb">
          {crumbs.length > 0 && (
            <>
              <Link href="/" className="flex items-center text-slate-400 transition-colors hover:text-primary">
                <Home className="h-4 w-4" />
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              {crumbs.map((crumb) => (
                <span key={crumb} className="flex items-center gap-1.5">
                  <span className="capitalize">{crumb}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                </span>
              ))}
            </>
          )}
          <span className="font-semibold capitalize text-slate-800">{current}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {initials(user.name)}
              </span>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-semibold text-slate-800">{user.name || "User"}</span>
                <span className={`mt-0.5 w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleColor(user.role)}`}>
                  {user.role || "Member"}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 transition-all hover:border-red-500 hover:bg-red-500 hover:text-white"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-dark px-5 py-1.5 text-sm font-semibold text-dark transition-colors hover:bg-dark hover:text-white"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}