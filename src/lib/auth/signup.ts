export interface SignupInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  state: string;
  district: string;
  termsAccepted: boolean;
  marketingOptIn?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  state: string;
  district: string;
  marketingOptIn: boolean;
}

export type SignupValidation =
  | { ok: true; data: SignupData }
  | { ok: false; error: string };

export function normalizeIndianMobile(raw: string): string | null {
  const trimmed = raw.trim().replace(/[\s\-().]/g, "");
  if (!/^\+?\d+$/.test(trimmed)) return null;
  let digits = trimmed.replace(/^\+/, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return digits;
}

export function validateSignup(input: SignupInput): SignupValidation {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = normalizeIndianMobile(input.phone ?? "");
  const state = (input.state ?? "").trim();
  const district = (input.district ?? "").trim();

  if (!name) return { ok: false, error: "Please enter your full name" };
  if (name.length > 100) return { ok: false, error: "Name must be 100 characters or fewer" };

  if (!email) return { ok: false, error: "Please enter your email address" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address" };
  }

  if (!input.password || input.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  if (!input.phone?.trim()) return { ok: false, error: "Please enter your mobile number" };
  if (!phone) {
    return {
      ok: false,
      error: "Please enter a valid 10-digit Indian mobile number (starting 6-9)",
    };
  }

  if (!state) return { ok: false, error: "Please select your state" };
  if (state.length > 50) return { ok: false, error: "State must be 50 characters or fewer" };

  if (!district) return { ok: false, error: "Please enter your district or village" };
  if (district.length > 80) {
    return { ok: false, error: "District must be 80 characters or fewer" };
  }

  if (input.termsAccepted !== true) {
    return {
      ok: false,
      error: "You must agree to the Terms of Service and Privacy Policy to create an account",
    };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      password: input.password,
      phone,
      state,
      district,
      marketingOptIn: input.marketingOptIn === true,
    },
  };
}
