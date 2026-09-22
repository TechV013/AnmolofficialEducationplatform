"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, LogIn, Home } from "lucide-react";

export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 text-text">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-text">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted">
          {error?.message || "An unexpected error occurred."}
        </p>
        {error?.digest && (
          <p className="mt-2 text-[11px] font-mono text-slate-400">Error ID: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => retry()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 px-4 text-sm font-bold text-white transition-all hover:bg-primary-hover"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-slate-50 py-3 px-4 text-sm font-bold text-text transition-all hover:bg-slate-100"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign in again</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl py-2 px-4 text-xs font-semibold text-muted transition-all hover:text-text"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
