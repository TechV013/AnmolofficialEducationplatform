"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { getSession } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Info } from "lucide-react";

const REASON_MESSAGES: Record<string, string> = {
  session_changed:
    "Your session has changed in another tab. Please sign in again.",
  account_inactive:
    "Your account has been deactivated. Please contact support.",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;
      router.push(role === "ADMIN" ? "/admin" : role === "INSTRUCTOR" ? "/instructor" : "/dashboard");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-center items-center px-4 py-12">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-3xl shadow-xl shadow-primary/5 border border-border/80 w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-border p-2.5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Image
                src="/images/logo.png"
                alt="anmolofficials"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-bold tracking-tight text-text">
              anmolofficials
            </span>
            <p className="text-xs font-semibold text-muted tracking-wide mt-1">
              our journey starts from here
            </p>
          </Link>
        </div>

        <div className="text-center mb-6 pt-2 border-t border-border/60">
          <h1 className="text-xl font-bold text-text">Welcome Back</h1>
          <p className="text-sm text-muted mt-1">Sign in to continue your learning journey</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>{error}</span>
          </div>
        )}

        {reason && REASON_MESSAGES[reason] && (
          <div className="mb-5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-center gap-2.5">
            <Info className="h-4 w-4 shrink-0" />
            <span>{REASON_MESSAGES[reason]}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-text placeholder:text-muted/60 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-text uppercase tracking-wider">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-background/50 border border-border rounded-xl text-text placeholder:text-muted/60 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
