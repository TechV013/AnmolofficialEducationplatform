import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { databaseTarget, env, type Role } from "./env";

const root = resolve(__dirname, "..", "..");

export const AUTH_DIR = resolve(root, "e2e", ".auth");

export type RoleStatus = Record<Role, boolean>;

export interface AuthStatus {
  roles: RoleStatus;
  /** Human-readable reasons, keyed by role. Never contains credentials. */
  reasons: Partial<Record<Role, string>>;
  database: { dedicated: boolean; fingerprint: string };
  payuSandbox: { ready: boolean; reason?: string };
}

const STATUS_FILE = resolve(AUTH_DIR, "status.json");

export function statusPath(): string {
  return STATUS_FILE;
}

export function writeAuthStatus(status: AuthStatus): void {
  mkdirSync(AUTH_DIR, { recursive: true });
  writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2), "utf8");
}

export function readAuthStatus(): AuthStatus {
  const fallback: AuthStatus = {
    roles: { student: false, instructor: false, admin: false },
    reasons: {},
    database: { dedicated: false, fingerprint: "unknown" },
    payuSandbox: { ready: false, reason: "status file missing" }
  };
  if (!existsSync(STATUS_FILE)) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(readFileSync(STATUS_FILE, "utf8")) as AuthStatus) };
  } catch {
    return fallback;
  }
}

export function storageStatePath(role: Role): string {
  return resolve(AUTH_DIR, `${role}.json`);
}

/**
 * Write journeys (enrollment, lesson progress, course creation) mutate the
 * database. They only run when a dedicated E2E database is configured, so the
 * suite can never write into the application's own database.
 */
export function writeJourneysEnabled(): { enabled: boolean; reason?: string } {
  const target = databaseTarget();
  if (!target.url) {
    return {
      enabled: false,
      reason: "E2E_DATABASE_URL is not set — write journeys are blocked to protect the app database"
    };
  }
  if (!target.dedicated) {
    return {
      enabled: false,
      reason: "E2E_DATABASE_URL matches DATABASE_URL — refusing to run write journeys against it"
    };
  }
  if (env("E2E_ALLOW_WRITE_JOURNEYS") === "1") return { enabled: true };
  return {
    enabled: true,
    reason: `using dedicated E2E database ${target.fingerprint}`
  };
}