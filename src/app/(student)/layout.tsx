import { requireStudent } from "@/lib/auth/helpers";
import NavMenu from "@/components/nav/StudentNavMenu";
import WorkspaceHeader from "@/components/layout/WorkspaceHeader";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();

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