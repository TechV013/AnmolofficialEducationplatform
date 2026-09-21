export default function StudentMyLearningLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-56" />
      <div className="h-3 bg-slate-100 rounded w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <div className="aspect-video bg-slate-200 rounded-xl" />
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-2 bg-slate-100 rounded-full w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
