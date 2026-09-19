"use client";
import Link from "next/link";
import Image from "next/image";
import { Home, BookOpen, LayoutDashboard, Users } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { AuthUser } from "@/types/auth";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/community", label: "Community" },
  { href: "/about", label: "About" },
  { href: "/about-us", label: "Team" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const user = session?.user as AuthUser | null;

  const handleMyCourses = () => {
    if (user?.role === "ADMIN") router.push("/admin");
    else if (user?.role === "INSTRUCTOR") router.push("/instructor");
    else router.push("/dashboard");
  };

  const learnHref = user
    ? user.role === "ADMIN"
      ? "/admin"
      : user.role === "INSTRUCTOR"
        ? "/instructor"
        : "/dashboard"
    : "/login";

  return (
    <>
      {/* Desktop / tablet top navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-border/50 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/images/logo.png" alt="Logo" width={100} height={40} className="h-10 w-auto" />
          </Link>
          <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-dark">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors",
                  pathname === link.href ? "text-primary font-semibold" : "hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {status === "loading" ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <button onClick={handleMyCourses} className="border-2 border-primary text-primary px-4 py-2 rounded-full font-semibold text-sm hover:bg-primary hover:text-white transition-colors">
                {user?.role === "ADMIN" ? "Admin Panel" : user?.role === "INSTRUCTOR" ? "Instructor Dashboard" : "My Courses"}
              </button>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="border-2 border-dark text-dark px-4 py-2 rounded-full font-semibold text-sm hover:bg-dark hover:text-white transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="border-2 border-dark text-dark px-6 py-2 rounded-full font-semibold hover:bg-dark hover:text-white transition-all text-sm">
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="sticky top-0 z-50 h-14 flex items-center justify-between border-b border-border/50 bg-white/80 px-4 backdrop-blur-md md:hidden">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="Logo" width={72} height={32} className="h-9 w-auto" />
        </Link>
        {status === "loading" ? (
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
        ) : session ? (
          <button
            onClick={handleMyCourses}
            className="rounded-full border-2 border-primary px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            {user?.role === "ADMIN" ? "Admin" : user?.role === "INSTRUCTOR" ? "Instructor" : "My Courses"}
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded-full border-2 border-dark px-4 py-1.5 text-xs font-semibold text-dark transition-colors hover:bg-dark hover:text-white"
          >
            Login
          </Link>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-white/80 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
              pathname === "/" ? "text-primary" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Home className="h-5 w-5" />
            Home
          </Link>
          <Link
            href="/courses"
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
              pathname.startsWith("/courses") ? "text-primary" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <BookOpen className="h-5 w-5" />
            Courses
          </Link>
          <Link
            href="/community"
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
              pathname.startsWith("/community") ? "text-primary" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Users className="h-5 w-5" />
            Community
          </Link>
          <Link
            href={learnHref}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
              pathname.startsWith(learnHref) && learnHref !== "/login" ? "text-primary" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Learn
          </Link>
        </div>
      </nav>
    </>
  );
}