export default function StudentAssignmentsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-56" />
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-6 bg-slate-100 rounded-full w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
