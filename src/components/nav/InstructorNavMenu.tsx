"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, FileText, List, ClipboardList, UserCircle, BarChart2, User } from "lucide-react";

export default function InstructorNavMenu() {
  const pathname = usePathname();

  // Base routes
  const baseRoutes = [
    { href: "/instructor", label: "Dashboard", icon: Home },