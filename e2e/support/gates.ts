import { test } from "@playwright/test";
import { readAuthStatus, writeJourneysEnabled } from "./auth-status";
import type { Role } from "./env";

/**
 * Gate helpers. A smoke test that cannot run in this environment reports as
 * SKIPPED with a reason instead of FAILING, so real regressions stay visible.
 *
 * These MUST be called from inside a test or beforeEach. Describe-scope
 * test.skip() is evaluated while test files are collected, which happens before
 * the setup project has written the auth status, so it would read stale data.
 */

export function roleSkipReason(role: Role): string | null {
  const status = readAuthStatus();
  if (status.roles[role]) return null;
  return status.reasons[role] ?? `no ${role} session was established during auth setup`;
}

export function writeJourneySkipReason(): string | null {
  const enabled = writeJourneysEnabled();
  return enabled.enabled ? null : (enabled.reason ?? "write journeys are disabled");
}

export function paymentSkipReason(): string | null {
  const status = readAuthStatus();
  if (status.payuSandbox.ready) return null;
  return status.payuSandbox.reason ?? "PayU sandbox is not configured";
}

export function requireRole(role: Role): void {
  const reason = roleSkipReason(role);
  test.skip(Boolean(reason), reason ?? "");
}

export function requireWriteJourneys(): void {
  const reason = writeJourneySkipReason();
  test.skip(Boolean(reason), reason ?? "");
}

export function requirePayuSandbox(): void {
  const reason = paymentSkipReason();
  test.skip(Boolean(reason), reason ?? "");
}