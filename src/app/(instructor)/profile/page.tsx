import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import NavMenu from "@/components/nav/InstructorNavMenu";

export default function ProfilePage({ params }: { params: { courseId?: string } }) {
  return (
    <>
      <WorkspaceHeader title="Profile" />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">