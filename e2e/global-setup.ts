import { readAuthStatus, writeAuthStatus, type AuthStatus, type RoleStatus } from "./support/auth-status";
import { databaseTarget, payuConfiguredForSandbox } from "./support/env";

/**
 * Global setup: decide, once, what this run is allowed to do.
 *
 * Hard rules:
 *  - If E2E_DATABASE_URL equals DATABASE_URL the run ABORTS. That would mean
 *    fixtures and write journeys hit the application's own database.
 *  - No `prisma migrate reset`, ever. Only `migrate deploy` against a dedicated
 *    E2E database, and only when one is configured.
 *  - No secret values are printed; only variable names and a host/db fingerprint.
 */
export default async function globalSetup(): Promise<void> {
  const target = databaseTarget();

  if (target.url && !target.dedicated) {
    throw new Error(
      "E2E_DATABASE_URL is identical to DATABASE_URL. Refusing to run: E2E must target a dedicated database. " +
        "Remove E2E_DATABASE_URL to run read-only smoke tests."
    );
  }

  const payu = payuConfiguredForSandbox();
  const status: AuthStatus = {
    roles: { student: false, instructor: false, admin: false } as RoleStatus,
    reasons: {},
    database: { dedicated: target.dedicated, fingerprint: target.fingerprint },
    payuSandbox: payu
  };

  const writes = target.url && target.dedicated;
  console.log("[e2e] database target:", target.fingerprint, writes ? "(dedicated, write journeys enabled)" : "(app database, write journeys BLOCKED)");
  console.log("[e2e] payu sandbox:", payu.ready ? "ready" : `unavailable — ${payu.reason}`);

  writeAuthStatus(status);

  const previous = readAuthStatus();
  for (const role of ["student", "instructor", "admin"] as const) {
    if (!previous.roles[role] && previous.reasons[role]) status.reasons[role] = previous.reasons[role];
  }
  writeAuthStatus(status);
}