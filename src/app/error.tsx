"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LogIn, Home } from "lucide-react";

const AUTH_ERROR_PATTERNS = /unauthorized|forbidden|role mismatch|account deactivated|not found in database/i;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const isAuthError = AUTH_ERROR_PATTERNS.test(error?.message || "");

  useEffect(() => {
    console.error("Global application error:", error);
    if (isAuthError) {
      router.replace("/login?reason=session_changed");
    }
  }, [error, isAuthError, router]);

  if (isAuthError) {
    return (
      <html lang="en">
        <body className="flex min-h-screen items-center justify-center bg-background px-4 text-text">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <LogIn className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-text">Redirecting to login...</h2>
            <p className="mt-2 text-sm text-muted">
              Your session has changed. Taking you to sign in.
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 text-text">
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
              onClick={() => reset()}
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
      </body>
    </html>
  );
}
