"use client";
import Link from "next/link";
import Image from "next/image";
import { Home, BookOpen, LayoutDashboard, Users } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { AuthUser } from "@/types/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as AuthUser | null;

  const handleMyCourses = () => {
    if (user?.role === "ADMIN") router.push("/admin");
    else if (user?.role === "INSTRUCTOR") router.push("/instructor");
    else router.push("/dashboard");
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background border-b border-border hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/images/logo.png" alt="Logo" width={100} height={40} className="h-10 w-auto" />
          </Link>
          <div className="flex items-center space-x-8 text-sm font-medium text-dark">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/courses" className="hover:text-primary transition-colors">Courses</Link>
            <Link href="/community" className="hover:text-primary transition-colors">Community</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/about-us" className="hover:text-primary transition-colors">Team</Link>
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border py-3 flex justify-around items-center">
        <Link href="/" className="flex flex-col items-center"><Home className="w-6 h-6" /><span className="text-[10px]">Home</span></Link>
        <Link href="/courses" className="flex flex-col items-center"><BookOpen className="w-6 h-6" /><span className="text-[10px]">Courses</span></Link>
        <Link href="/community" className="flex flex-col items-center"><Users className="w-6 h-6" /><span className="text-[10px]">Community</span></Link>
        <button onClick={handleMyCourses} className="flex flex-col items-center"><LayoutDashboard className="w-6 h-6" /><span className="text-[10px]">Learn</span></button>
      </nav>
    </>
  );
}