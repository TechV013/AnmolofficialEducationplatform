import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import NavMenu from "@/components/nav/InstructorNavMenu";

export default function AnalyticsPage({ params }: { params: { courseId?: string } }) {
  return (
    <>
      <WorkspaceHeader title="Analytics" />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">