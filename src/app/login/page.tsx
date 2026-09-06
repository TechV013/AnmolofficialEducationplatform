"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    router.push("/dashboard");
  };

  const handleDemoLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isDemo", "true");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-light-gray flex items-center justify-center px-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-blue mb-2">@anmlofficials</div>
          <h1 className="text-2xl font-bold text-black">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to continue your learning journey</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-primary-hover transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="#" className="text-primary text-sm hover:underline">Forgot password?</Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-400">or</span>
          </div>
        </div>

        <button
          onClick={(e) => { e.preventDefault(); handleDemoLogin(); }}
          className="w-full border-2 border-blue text-blue py-3 rounded-xl font-bold hover:bg-blue hover:text-white transition-colors"
        >
          Continue as Demo Student
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="#" className="text-primary font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </main>
  );
}
