import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import NavMenu from "@/components/nav/AdminNavMenu";

export default function Page() {
  return (
    <>
      <WorkspaceHeader title="Page" />
      <div className="flex h-[calc(100vh-64px)]">
        <NavMenu />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold"></h1>
          <p className="text-muted-foreground">Content coming soon.</p>
        </main>
      </div>
    </>
  );
}