export default function StudentNotesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-56" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-white p-5 space-y-3">
            <div className="h-5 bg-slate-200 rounded w-1/4" />
            <div className="h-32 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
