"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, List, FileText, Banknote, CreditCard, Award, MessageCircle, Settings } from "lucide-react";

export default function AdminNavMenu() {
  const pathname = usePathname();

  const routes = [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/users", label: "Users", icon: Users },