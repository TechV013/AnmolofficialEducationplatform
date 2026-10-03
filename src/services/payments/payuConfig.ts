/**
 * Single source of truth for PayU configuration.
 *
 * Read lazily and fail with an actionable message rather than at module load:
 * a missing gateway credential should surface as a clear checkout error, not
 * crash the whole app during module initialisation.
 */

export class PaymentConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentConfigError";
  }
}

export interface PayUConfig {
  key: string;
  salt: string;
  isProduction: boolean;
}

type PayUEnvironment = "TEST" | "PRODUCTION";

/**
 * Vercel env values are literal — a value pasted with surrounding quotes keeps
 * those quote characters, and an interior space would corrupt the hash on both
 * ends. Trim paste artifacts; reject anything that cannot be a PayU credential.
 */
function sanitizeCredential(name: string, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new PaymentConfigError(`${name} is empty.`);
  }
  if (/["']/.test(trimmed)) {
    throw new PaymentConfigError(
      `${name} contains quote characters. Paste the raw value without quotes.`
    );
  }
  if (/\s/.test(trimmed)) {
    throw new PaymentConfigError(
      `${name} contains whitespace inside the value. Paste the raw value unchanged.`
    );
  }
  return trimmed;
}

/**
 * `PAYU_ENV` decides whether requests hit test.payu.in or secure.payu.in.
 * An exact-case match used to be required, so `production` or `Production`
 * silently routed live credentials at the test endpoint — which PayU rejects
 * with an opaque "Pardon, Some Problem Occurred" page instead of naming the
 * mismatch. Normalise case, and refuse anything that is not TEST/PRODUCTION so
 * a typo fails here with a clear message rather than at the gateway.
 */
function resolveEnvironment(): PayUEnvironment {
  const raw = process.env.PAYU_ENV;
  const value = (raw ?? "").trim().toUpperCase();
  if (!value) {
    throw new PaymentConfigError(
      "PAYU_ENV is not set. Set it to TEST or PRODUCTION so checkout targets the matching PayU endpoint."
    );
  }
  if (value !== "TEST" && value !== "PRODUCTION") {
    throw new PaymentConfigError(
      `PAYU_ENV must be TEST or PRODUCTION, received "${value.slice(0, 20)}".`
    );
  }
  return value;
}

/** Returns why PayU is not configured, or null when it is ready to use. */
export function getPayUConfigIssue(): string | null {
  try {
    getPayUConfig();
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : "Payments are not configured.";
  }
}

export function isPayUConfigured(): boolean {
  return getPayUConfigIssue() === null;
}

export function getPayUConfig(): PayUConfig {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SECRET;

  if (!key || !salt) {
    throw new PaymentConfigError(
      "Payments are not configured. Set PAYU_MERCHANT_KEY, PAYU_MERCHANT_SECRET and PAYU_ENV."
    );
  }

  const environment = resolveEnvironment();
  return {
    key: sanitizeCredential("PAYU_MERCHANT_KEY", key),
    salt: sanitizeCredential("PAYU_MERCHANT_SECRET", salt),
    isProduction: environment === "PRODUCTION"
  };
}

/** Hosted checkout endpoint that the payment form posts to. */
export function getPayUCheckoutUrl(): string {
  return getPayUConfig().isProduction
    ? "https://secure.payu.in/_payment"
    : "https://test.payu.in/_payment";
}

/**
 * Absolute site origin used to build PayU return URLs. PayU requires these to
 * be reachable by the browser, so they must come from public configuration and
 * never from an unvalidated request header.
 */
export function getPublicOrigin(): string | null {
  const raw = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}
