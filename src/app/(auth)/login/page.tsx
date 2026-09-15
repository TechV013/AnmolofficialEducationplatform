"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Demo role shortcuts (prefill email only; user enters password)
  const demoRoles = [
    { label: "Continue as Demo Student", email: "student.demo@anmolofficial.com", role: "STUDENT", color: "blue" },
    { label: "Continue as Demo Instructor", email: "instructor.demo@anmolofficial.com", role: "INSTRUCTOR", color: "purple" },
    { label: "Continue as Demo Admin", email: "admin.demo@anmolofficial.com", role: "ADMIN", color: "navy" },
  ];

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      // Role-based redirect from session
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;
      router.push(role === "ADMIN" ? "/admin" : role === "INSTRUCTOR" ? "/instructor" : "/dashboard");
      router.refresh();
    }
  };

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("");
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-400">or sign in with a demo account</span>
          </div>
        </div>

        {/* Role-specific demo buttons — prefill email, require password from env */}
        <div className="space-y-2">
          {demoRoles.map((demo) => (
            <button
              key={demo.email}
              onClick={() => handleDemoSelect(demo.email)}
              className={`w-full border-2 rounded-xl font-bold py-3 transition-colors ${
                demo.color === "blue" ? "border-blue-600 text-blue-600 hover:bg-blue-50" :
                demo.color === "purple" ? "border-purple-600 text-purple-600 hover:bg-purple-50" :
                "border-gray-800 text-gray-800 hover:bg-gray-50"
              }`}
            >
              {demo.label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}