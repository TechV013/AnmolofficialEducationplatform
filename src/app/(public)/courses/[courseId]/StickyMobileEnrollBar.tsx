"use client";
import EnrollButton from "./EnrollButton";

interface StickyMobileEnrollBarProps {
  courseId: string;
  isFree: boolean;
  isEnrolled: boolean;
  isSignedIn: boolean;
  priceLabel: string;
  mrpLabel?: string;
  discount: number;
}

export default function StickyMobileEnrollBar({
  courseId,
  isFree,
  isEnrolled,
  isSignedIn,
  priceLabel,
  mrpLabel,
  discount
}: StickyMobileEnrollBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <div className="min-w-0">
          {isFree ? (
            <p className="text-xl font-extrabold text-text">Free</p>
          ) : (
            <p className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-text">{priceLabel}</span>
              {mrpLabel && <span className="text-sm text-muted line-through">{mrpLabel}</span>}
            </p>
          )}
          {discount > 0 && <p className="text-[11px] font-bold text-emerald-600">{discount}% off</p>}
        </div>
        <div className="w-44 shrink-0">
          <EnrollButton courseId={courseId} isFree={isFree} isEnrolled={isEnrolled} isSignedIn={isSignedIn} />
        </div>
      </div>
    </div>
  );
}