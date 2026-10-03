"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ChevronDown,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { validateSignup } from "@/lib/auth/signup";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const INPUT_CLASS =
  "w-full pl-11 pr-4 py-3 bg-background/50 border border-border rounded-xl text-text placeholder:text-muted/60 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium";
const SELECT_CLASS =
  "w-full pl-11 pr-10 py-3 bg-background/50 border border-border rounded-xl text-text focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium appearance-none";
const LABEL_CLASS =
  "block text-xs font-semibold text-text uppercase tracking-wider mb-1.5";

function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^\w\s]/.test(value)) score++;
  return Math.min(score, 4);
}

const STRENGTH_META = [
  { label: "Too short", bar: "bg-red-400", width: "w-1/5" },
  { label: "Weak", bar: "bg-red-500", width: "w-1/4" },
  { label: "Fair", bar: "bg-amber-500", width: "w-3/5" },
  { label: "Good", bar: "bg-lime-500", width: "w-4/5" },
  { label: "Strong", bar: "bg-emerald-500", width: "w-full" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    state: "",
    district: "",
    termsAccepted: false,
    marketingOptIn: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (patch: Partial<typeof formData>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const validation = validateSignup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      state: formData.state,
      district: formData.district,
      termsAccepted: formData.termsAccepted,
      marketingOptIn: formData.marketingOptIn,
    });
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: validation.data.name,
          email: validation.data.email,
          password: validation.data.password,
          phone: validation.data.phone,
          state: validation.data.state,
          district: validation.data.district,
          termsAccepted: true,
          marketingOptIn: validation.data.marketingOptIn,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create account.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordScore(formData.password);
  const strengthMeta = STRENGTH_META[formData.password ? strength : 0];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-center items-center px-4 py-12">
      {/* Ambient background glow accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Main card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 sm:p-10 rounded-3xl shadow-xl shadow-primary/5 border border-border/80 w-full max-w-md">
        {/* Brand header */}
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

        {/* Section title */}
        <div className="text-center mb-6 pt-2 border-t border-border/60">
          <h1 className="text-xl font-bold text-text">Create an Account</h1>
          <p className="text-sm text-muted mt-1">Start your creative learning journey today</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-5">
          <GoogleSignInButton label="Sign up with Google" />
          <p className="text-center text-xs text-muted mt-2">
            Your email is verified by Google — no passwords required.
          </p>
          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap">
              or sign up with email
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className={LABEL_CLASS}>Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => update({ name: e.target.value })}
                autoComplete="name"
                className={INPUT_CLASS}
                required
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => update({ email: e.target.value })}
                autoComplete="email"
                className={INPUT_CLASS}
                required
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Mobile Number</label>
            <div className="relative">
              <Phone className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                inputMode="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => update({ phone: e.target.value })}
                autoComplete="tel-national"
                className={INPUT_CLASS}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>State</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.state}
                  onChange={(e) => update({ state: e.target.value })}
                  className={SELECT_CLASS}
                  required
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>District / Village</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  placeholder="e.g. Sitapur"
                  value={formData.district}
                  onChange={(e) => update({ district: e.target.value })}
                  autoComplete="address-level2"
                  className={INPUT_CLASS}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => update({ password: e.target.value })}
                autoComplete="new-password"
                minLength={8}
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
            {formData.password && (
              <div className="mt-2 flex items-center gap-2.5">
                <div className="h-1.5 flex-1 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strengthMeta.bar} ${strengthMeta.width}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-muted w-16 text-right">
                  {strengthMeta.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className={LABEL_CLASS}>Confirm Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => update({ confirmPassword: e.target.value })}
                autoComplete="new-password"
                className="w-full pl-11 pr-11 py-3 bg-background/50 border border-border rounded-xl text-text placeholder:text-muted/60 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => update({ termsAccepted: e.target.checked })}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                required
              />
              <span className="text-[13px] leading-snug text-text/80 group-hover:text-text transition-colors">
                I have read and agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#1e2a5a] hover:text-primary hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.marketingOptIn}
                onChange={(e) => update({ marketingOptIn: e.target.checked })}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
              />
              <span className="text-[13px] leading-snug text-text/80 group-hover:text-text transition-colors">
                I agree to receive product updates, newsletters, and promotional
                communications by email. I understand I can unsubscribe at any time.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
