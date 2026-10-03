import { describe, it, expect } from "vitest";
import {
  normalizeIndianMobile,
  validateSignup,
  type SignupInput,
} from "@/lib/auth/signup";

const base: SignupInput = {
  name: "Asha Kumar",
  email: "Asha@Example.com",
  password: "secret123",
  phone: "9876543210",
  state: "Uttar Pradesh",
  district: "Sitapur",
  termsAccepted: true,
  marketingOptIn: false,
};

describe("normalizeIndianMobile", () => {
  it("accepts a plain 10-digit number starting 6-9", () => {
    expect(normalizeIndianMobile("9876543210")).toBe("9876543210");
    expect(normalizeIndianMobile("6123456789")).toBe("6123456789");
  });

  it("strips +91, 91, 0 prefixes and separators", () => {
    expect(normalizeIndianMobile("+91 98765 43210")).toBe("9876543210");
    expect(normalizeIndianMobile("91-9876-543210")).toBe("9876543210");
    expect(normalizeIndianMobile("09876543210")).toBe("9876543210");
    expect(normalizeIndianMobile("(98765) 43210")).toBe("9876543210");
  });

  it("rejects numbers that do not start 6-9", () => {
    expect(normalizeIndianMobile("5876543210")).toBeNull();
    expect(normalizeIndianMobile("1234567890")).toBeNull();
  });

  it("rejects wrong lengths and non-digits", () => {
    expect(normalizeIndianMobile("987654321")).toBeNull();
    expect(normalizeIndianMobile("98765432101")).toBeNull();
    expect(normalizeIndianMobile("98765abc210")).toBeNull();
    expect(normalizeIndianMobile("")).toBeNull();
  });
});

describe("validateSignup", () => {
  it("accepts a complete valid signup and normalizes fields", () => {
    const result = validateSignup({ ...base, phone: "+91 98765 43210" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.email).toBe("asha@example.com");
      expect(result.data.phone).toBe("9876543210");
      expect(result.data.name).toBe("Asha Kumar");
      expect(result.data.marketingOptIn).toBe(false);
    }
  });

  it("passes marketing opt-in through when explicitly true", () => {
    const result = validateSignup({ ...base, marketingOptIn: true });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.marketingOptIn).toBe(true);
  });

  it("requires Terms of Service acceptance", () => {
    const result = validateSignup({ ...base, termsAccepted: false });
    expect(result).toEqual({
      ok: false,
      error:
        "You must agree to the Terms of Service and Privacy Policy to create an account",
    });
  });

  it("rejects an invalid email", () => {
    expect(validateSignup({ ...base, email: "not-an-email" })).toEqual({
      ok: false,
      error: "Please enter a valid email address",
    });
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(validateSignup({ ...base, password: "short" })).toEqual({
      ok: false,
      error: "Password must be at least 8 characters",
    });
  });

  it("rejects an invalid mobile number with a helpful message", () => {
    const result = validateSignup({ ...base, phone: "12345" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/valid 10-digit Indian mobile/);
  });

  it("requires a mobile number", () => {
    expect(validateSignup({ ...base, phone: "" })).toEqual({
      ok: false,
      error: "Please enter your mobile number",
    });
  });

  it("requires state and district", () => {
    expect(validateSignup({ ...base, state: "" })).toEqual({
      ok: false,
      error: "Please select your state",
    });
    expect(validateSignup({ ...base, district: "   " })).toEqual({
      ok: false,
      error: "Please enter your district or village",
    });
  });

  it("caps state and district lengths", () => {
    expect(validateSignup({ ...base, state: "x".repeat(51) }).ok).toBe(false);
    expect(validateSignup({ ...base, district: "x".repeat(81) }).ok).toBe(false);
  });

  it("requires a name", () => {
    expect(validateSignup({ ...base, name: "  " })).toEqual({
      ok: false,
      error: "Please enter your full name",
    });
  });
});
