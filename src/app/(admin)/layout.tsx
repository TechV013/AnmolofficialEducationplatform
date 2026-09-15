import { requireAdmin } from "@/lib/auth/helpers";
import NavMenu from "@/components/nav/AdminNavMenu";
import WorkspaceHeader from "@/components/layout/WorkspaceHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <>
      <WorkspaceHeader user={user} />
      <div className="flex h-[calc(100vh-64px)]">
        <NavMenu />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </>
  );
}