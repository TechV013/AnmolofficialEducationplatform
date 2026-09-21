export default function InstructorCourseEditLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 bg-slate-200 rounded w-8" />
        <div className="h-8 bg-slate-200 rounded w-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-12 bg-slate-200 rounded-xl w-full" />
          <div className="h-32 bg-slate-100 rounded-xl w-full" />
          <div className="h-10 bg-slate-200 rounded-xl w-48" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-slate-100 rounded-2xl" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
