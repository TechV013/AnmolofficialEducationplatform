
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();                
    // Development-only demo path
    if (process.env.NODE_ENV !== 'development') return;                
    // Simple demo action - can connect to a specific demo user
    // Router push to dashboard, next-auth session is not created.
    // WARNING: This is now visibly dev-only.
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-surface p-8 sm:p-12 rounded-3xl shadow-sm border border-border w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-primary mb-2">@anmlofficials</div>
          <h1 className="text-2xl font-bold text-text">Welcome Back</h1>
          <p className="text-muted mt-2">Sign in to continue your learning journey</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-primary-hover transition-colors"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="#" className="text-primary text-sm hover:underline">Forgot password?</Link>
        </div>

        {process.env.NODE_ENV === 'development' && (
            <>
                <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-400">or</span>
                </div>
                </div>

                <button
                onClick={handleDemoLogin}
                className="w-full border-2 border-blue text-blue py-3 rounded-xl font-bold hover:bg-blue hover:text-white transition-colors"
                >
                Continue as Demo Student (Dev)
                </button>
            </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
