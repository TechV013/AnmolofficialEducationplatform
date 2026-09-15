import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import NavMenu from "@/components/nav/StudentNavMenu";

export default function Page() {
  return (
    <>
      <WorkspaceHeader title="Page" />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Page</h1>
        <p className="text-muted-foreground">Content coming soon.</p>
      </div>
    </>
  );
}