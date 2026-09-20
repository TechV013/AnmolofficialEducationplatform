import { Star } from "lucide-react";

interface RatingSummaryProps {
  avgRating: number;
  reviewsCount: number;
  distribution: { rating: number; count: number }[];
}

const MAX = 5;

export default function RatingSummary({ avgRating, reviewsCount, distribution }: RatingSummaryProps) {
  const total = distribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="grid gap-6 rounded-xl border border-border bg-white p-6 sm:grid-cols-[auto_1fr] sm:gap-10">
      <div className="text-center">
        <p className="text-5xl font-extrabold text-text">{avgRating.toFixed(1)}</p>
        <div className="mt-2 flex justify-center gap-0.5">
          {Array.from({ length: MAX }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-medium text-muted">
          {reviewsCount === 0 ? "No ratings yet" : `${reviewsCount} rating${reviewsCount === 1 ? "" : "s"}`}
        </p>
      </div>

      {total > 0 && (
        <div className="flex flex-col justify-center gap-2">
          {distribution
            .slice()
            .sort((a, b) => b.rating - a.rating)
            .map((bar) => {
              const pct = total > 0 ? Math.round((bar.count / total) * 100) : 0;
              return (
                <div key={bar.rating} className="flex items-center gap-3 text-xs">
                  <span className="w-3 font-bold text-text">{bar.rating}</span>
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-soft-blue">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted">{bar.count}</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}