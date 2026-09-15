import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import NavMenu from "@/components/nav/InstructorNavMenu";

export default function Page({ params }: { params: { courseId: string } }) {
  return (
    <>
      <WorkspaceHeader title="Analytics" />
      <div className="flex h-[calc(100vh-64px)]">
        <NavMenu />
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Analytics for course {params.courseId} coming soon.</p>
        </main>
      </div>
    </>
  );
}