"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, ChartBar, ClipboardList, FileText, FileCheck, UserCircle, User } from "lucide-react";

export default function StudentNavMenu() {
  const pathname = usePathname();

  const routes = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/my-learning", label: "My Learning", icon: BookOpen },