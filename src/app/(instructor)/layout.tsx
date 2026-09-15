import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import NavMenu from "@/components/nav/InstructorNavMenu";
import WorkspaceHeader from "@/components/layout/WorkspaceHeader";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | null;

  return (
    <>
      <WorkspaceHeader user={user} onSignOut={() => signOut()} />
      <div className="flex h-[calc(100vh-64px)]">
        <NavMenu />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </>