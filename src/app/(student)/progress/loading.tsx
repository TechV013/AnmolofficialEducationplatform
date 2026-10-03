export default function StudentProgressLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-56" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <div className="h-9 w-9 bg-slate-200 rounded-lg" />
            <div className="h-7 bg-slate-200 rounded w-1/2" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-48" />
                <div className="h-3 bg-slate-100 rounded w-32" />
              </div>
              <div className="h-6 bg-slate-100 rounded-full w-16" />
            </div>
            <div className="h-2 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
