"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LogIn, Home } from "lucide-react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-text">Session Updated</h2>
        <p className="mt-2 text-sm text-muted">
          Your active session changed in another tab or window. Please refresh or sign in again.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-white transition-all hover:bg-primary-hover"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reload Page</span>
          </button>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-slate-50 py-3 px-4 text-sm font-bold text-text transition-all hover:bg-slate-100"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign in again</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
