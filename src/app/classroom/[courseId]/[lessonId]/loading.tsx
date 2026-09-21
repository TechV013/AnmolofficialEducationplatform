export default function ClassroomLoading() {
  return (
    <div className="flex h-screen bg-background overflow-hidden animate-pulse">
      <div className="hidden lg:block w-80 shrink-0 bg-surface border-r border-border p-5 space-y-4">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="space-y-3 mt-6">
          {[1, 2, 3].map(m => (
            <div key={m} className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="ml-4 space-y-1.5">
                {[1, 2, 3].map(l => (
                  <div key={l} className="h-3 bg-slate-100 rounded w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div className="aspect-video w-full bg-slate-200 rounded-2xl" />

        <div className="mt-6 space-y-4">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {[1, 2, 3, 4].map(t => (
              <div key={t} className="flex-1 h-9 bg-slate-200 rounded-lg" />
            ))}
          </div>

          <div className="space-y-3">
            <div className="h-7 bg-slate-200 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
            <div className="h-4 bg-slate-100 rounded w-4/6" />
          </div>

          <div className="h-11 bg-slate-200 rounded-full w-48" />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="h-12 bg-slate-200 rounded-xl w-40" />
          <div className="h-12 bg-primary/20 rounded-xl w-40" />
        </div>
      </div>
    </div>
  );
}
