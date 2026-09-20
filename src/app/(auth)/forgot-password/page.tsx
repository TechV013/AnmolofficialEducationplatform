"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    if (email.trim()) {
      setSubmitted(true);
    } else {
      setError("Please enter your email address.");
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-center items-center px-4 py-12">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Link href="/login" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-3xl shadow-xl shadow-primary/5 border border-border/80 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-text">Forgot password?</h1>
          <p className="text-sm text-muted mt-1">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm text-center">
            If an account exists for {email}, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-text uppercase tracking-wider mb-1.5">Email</label>
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

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          Remember your password?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}