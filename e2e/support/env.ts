import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * E2E environment loading.
 *
 * Precedence: process.env > .env.e2e.local > .env
 *
 * Credentials are only ever read here and passed straight to the browser. This
 * module never logs, formats or returns a password for display.
 */

const root = resolve(__dirname, "..", "..");

function readEnvFile(file: string): Record<string, string> {
  const path = resolve(root, file);
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv: Record<string, string> = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.e2e.local")
};

export function env(name: string): string | undefined {
  const value = process.env[name] ?? fileEnv[name];
  return value && value.length > 0 ? value : undefined;
}

export type Role = "student" | "instructor" | "admin";

export interface RoleCredentials {
  email: string;
  password: string;
}

/**
 * Demo accounts come from prisma/seed_roles.ts. Explicit E2E_* variables win so
 * the suite can point at dedicated E2E accounts instead.
 */
const DEMO_ACCOUNTS: Record<Role, { email: string; passwordEnv: string }> = {
  student: {
    email: "student.demo@anmolofficial.com",
    passwordEnv: "DEMO_STUDENT_PASSWORD"
  },
  instructor: {
    email: "instructor.demo@anmolofficial.com",
    passwordEnv: "DEMO_INSTRUCTOR_PASSWORD"
  },
  admin: {
    email: "admin.demo@anmolofficial.com",
    passwordEnv: "DEMO_ADMIN_PASSWORD"
  }
};

export function credentialsFor(role: Role): RoleCredentials | null {
  const email = env(`E2E_${role.toUpperCase()}_EMAIL`) ?? DEMO_ACCOUNTS[role].email;
  const password = env(`E2E_${role.toUpperCase()}_PASSWORD`) ?? env(DEMO_ACCOUNTS[role].passwordEnv);
  if (!email || !password) return null;
  return { email, password };
}

/** Names only. Values are never included so logs cannot leak secrets. */
export function missingCredentialVariables(): string[] {
  const missing: string[] = [];
  for (const role of ["student", "instructor", "admin"] as Role[]) {
    const upper = role.toUpperCase();
    if (!env(`E2E_${upper}_EMAIL`) && !env("DEMO_SEED_ACCOUNTS")) missing.push(`E2E_${upper}_EMAIL`);
    if (!env(`E2E_${upper}_PASSWORD`) && !env(DEMO_ACCOUNTS[role].passwordEnv))
      missing.push(`E2E_${upper}_PASSWORD`);
  }
  return missing;
}

export interface DatabaseTarget {
  url: string | null;
  /** True only when E2E_DATABASE_URL is set and differs from DATABASE_URL. */
  dedicated: boolean;
  /** Safe-to-print identifier: host and database name, never credentials. */
  fingerprint: string;
}

function fingerprint(url: string): string {
  try {
    const parsed = new URL(url);
    const db = parsed.pathname.replace(/^\//, "");
    return `${parsed.hostname}/${db || "(default)"}`;
  } catch {
    return "(unparseable url)";
  }
}

export function databaseTarget(): DatabaseTarget {
  const e2eUrl = env("E2E_DATABASE_URL") ?? null;
  const appUrl = env("DATABASE_URL") ?? null;
  if (!e2eUrl) {
    return {
      url: null,
      dedicated: false,
      fingerprint: appUrl ? `app-only:${fingerprint(appUrl)}` : "none"
    };
  }
  const dedicated = e2eUrl !== appUrl;
  return { url: e2eUrl, dedicated, fingerprint: fingerprint(e2eUrl) };
}

export function baseURL(): string {
  return env("E2E_BASE_URL") ?? "http://localhost:3000";
}

export function payuConfiguredForSandbox(): { ready: boolean; reason?: string } {
  const environment = (env("PAYU_ENV") ?? "").trim().toUpperCase();
  if (environment === "PRODUCTION") {
    return { ready: false, reason: "PAYU_ENV=PRODUCTION — refusing to run any payment journey" };
  }
  if (environment !== "TEST") {
    return { ready: false, reason: "PAYU_ENV is not TEST - sandbox payment journey skipped" };
  }
  if (!env("PAYU_MERCHANT_KEY") || !env("PAYU_MERCHANT_SECRET")) {
    return { ready: false, reason: "PAYU_MERCHANT_KEY / PAYU_MERCHANT_SECRET are not set" };
  }
  return { ready: true };
}