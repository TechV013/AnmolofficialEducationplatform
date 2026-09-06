"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Home, BookOpen, LayoutDashboard, MessageCircle } from "lucide-react";

export default function Navbar() {
  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-50 bg-[#EBF5FF] border-b border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/images/logo.png" alt="Logo" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center space-x-8 text-sm font-medium text-[#181D27]">
            <Link href="/" className="hover:text-[#0069E0] transition-colors">Home</Link>
            <Link href="/courses" className="hover:text-[#0069E0] transition-colors">Courses</Link>
            <Link href="#" className="hover:text-[#0069E0] transition-colors">Community</Link>
            <Link href="#" className="hover:text-[#0069E0] transition-colors">About</Link>
          </div>
          <Link href="/login" className="border-2 border-[#181D27] text-[#181D27] px-6 py-2 rounded-full font-semibold hover:bg-[#181D27] hover:text-white transition-all text-sm">
            Login
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#EBF5FF] border-t border-gray-200 py-3 flex justify-around items-center">
        <Link href="/" className="flex flex-col items-center text-[#181D27]"><Home className="w-6 h-6" /><span className="text-[10px]">Home</span></Link>
        <Link href="/courses" className="flex flex-col items-center text-[#181D27]"><BookOpen className="w-6 h-6" /><span className="text-[10px]">Courses</span></Link>
        <Link href="/dashboard" className="flex flex-col items-center text-[#181D27]"><LayoutDashboard className="w-6 h-6" /><span className="text-[10px]">Learn</span></Link>
        <a href="https://wa.me/919999999999" target="_blank" className="flex flex-col items-center text-[#25D366]"><MessageCircle className="w-6 h-6" /><span className="text-[10px]">Chat</span></a>
      </nav>
    </>
  );
}
