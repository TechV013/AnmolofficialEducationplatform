import { requireInstructor } from "@/lib/auth/helpers";
import NavMenu from "@/components/nav/InstructorNavMenu";
import MobileBottomNav from "@/components/nav/MobileBottomNav";
import WorkspaceHeader from "@/components/layout/WorkspaceHeader";

export default async function InstructorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireInstructor();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WorkspaceHeader user={user} />
      <div className="flex flex-1 relative overflow-hidden">
        <aside className="hidden md:block w-64 shrink-0 border-r border-border bg-white overflow-y-auto">
          <NavMenu />
        </aside>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <MobileBottomNav panel="instructor" />
    </div>
  );
}
