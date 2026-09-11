"use client";
import Link from "next/link";
import Image from "next/image";
import { Home, BookOpen, LayoutDashboard, MessageCircle, Users } from "lucide-react";

export default function Navbar() {
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
          <Link href="/login" className="border-2 border-dark text-dark px-6 py-2 rounded-full font-semibold hover:bg-dark hover:text-white transition-all text-sm">
            Login
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border py-3 flex justify-around items-center">
        <Link href="/" className="flex flex-col items-center"><Home className="w-6 h-6" /><span className="text-[10px]">Home</span></Link>
        <Link href="/courses" className="flex flex-col items-center"><BookOpen className="w-6 h-6" /><span className="text-[10px]">Courses</span></Link>
        <Link href="/community" className="flex flex-col items-center"><Users className="w-6 h-6" /><span className="text-[10px]">Community</span></Link>
        <Link href="/dashboard" className="flex flex-col items-center"><LayoutDashboard className="w-6 h-6" /><span className="text-[10px]">Learn</span></Link>
      </nav>
    </>
  );
}
