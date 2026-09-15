import WorkspaceHeader from "@/components/layout/WorkspaceHeader";
import NavMenu from "@/components/nav/InstructorNavMenu";

export default function StudentsPage({ params }: { params: { courseId?: string } }) {
  return (
    <>
      <WorkspaceHeader title="Students" />
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-muted-foreground">