export default function CourseDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="aspect-video bg-slate-200 rounded-2xl" />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-10 bg-slate-200 rounded w-3/4" />
          <div className="h-6 bg-slate-100 rounded w-1/3" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-5/6" />
          <div className="h-20 bg-slate-100 rounded-xl" />
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-slate-100 rounded-2xl" />
          <div className="h-12 bg-primary/10 rounded-xl" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
