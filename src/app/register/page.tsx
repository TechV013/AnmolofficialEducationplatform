"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    
    const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
        headers: { "Content-Type": "application/json" }
    });
    
    if (res.ok) router.push("/login");
    else setError((await res.json()).error);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-surface p-8 sm:p-12 rounded-3xl shadow-sm border border-border w-full max-w-md">
        <h1 className="text-2xl font-bold text-text mb-6">Create Account</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
            <input placeholder="Name" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, email: e.target.value})} required />
            <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, password: e.target.value})} required />
            <input type="password" placeholder="Confirm Password" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
            <button disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold">{loading ? "Loading..." : "Register"}</button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        <p className="mt-6 text-center text-muted">Already have an account? <Link href="/login" className="text-primary font-bold">Login</Link></p>
      </div>
    </main>
  );
}
