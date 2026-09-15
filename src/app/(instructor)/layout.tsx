import { requireInstructor } from "@/lib/auth/helpers";
import NavMenu from "@/components/nav/InstructorNavMenu";
import WorkspaceHeader from "@/components/layout/WorkspaceHeader";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireInstructor();

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