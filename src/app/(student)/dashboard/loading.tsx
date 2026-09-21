export default function StudentDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <div className="h-3 bg-slate-200 rounded w-2/3" />
            <div className="h-7 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
          <div className="h-5 bg-slate-200 rounded w-32" />
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-full" />
              <div className="h-2 bg-slate-100 rounded-full w-full" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-32" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
