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

export function isPayUConfigured(): boolean {
  return Boolean(process.env.PAYU_MERCHANT_KEY && process.env.PAYU_MERCHANT_SECRET);
}

export function getPayUConfig(): PayUConfig {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SECRET;

  if (!key || !salt) {
    throw new PaymentConfigError(
      "Payments are not configured. Set PAYU_MERCHANT_KEY, PAYU_MERCHANT_SECRET and PAYU_ENV."
    );
  }

  return { key, salt, isProduction: process.env.PAYU_ENV === "PRODUCTION" };
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