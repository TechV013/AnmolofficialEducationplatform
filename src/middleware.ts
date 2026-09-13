import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight in-memory sliding-window rate limiter (per deployment instance).
// Suitable for Vercel Edge middleware; not persistent across cold starts, but
// sufficient to blunt brute-force/registration-spam at the perimeter.
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // per IP per minute for auth/certificate routes
const hitCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hitCounts.get(key);
  if (!entry || now > entry.resetAt) {
    hitCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  // Rate limit only sensitive public routes
  const url = new URL(request.url);
  const isAuthRegister = url.pathname.startsWith("/api/auth/register");
  const isAuthSignin = url.pathname.startsWith("/api/auth/signin");
  const isCertLookup = url.pathname.startsWith("/api/certificates/");
  if (isAuthRegister || isAuthSignin || isCertLookup) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `${url.pathname}:${ip}`;
    if (isRateLimited(key)) {
      return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/api/auth/register", "/api/auth/signin", "/api/certificates/:path*", "/api/auth/[...nextauth]"],
};
