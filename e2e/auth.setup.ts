import { test as setup, expect } from "@playwright/test";
import { loginAs, trackRateLimits } from "./support/auth";
import { credentialsFor, type Role } from "./support/env";
import { readAuthStatus, storageStatePath, writeAuthStatus } from "./support/auth-status";

/**
 * Signs in each role exactly once and stores the session.
 *
 * The app rate-limits /api/auth/* to 20 requests/minute per IP, so signing in
 * per test would exhaust the budget and produce misleading 429 failures. All
 * authenticated specs reuse these storage states instead.
 *
 * A storage state file is always written (empty when the sign-in could not
 * happen) so specs can safely reference it.
 */

const ROLES: Role[] = ["student", "instructor", "admin"];

for (const role of ROLES) {
  setup(`authenticate as ${role}`, async ({ page }) => {
    const status = readAuthStatus();

    const persist = async () => {
      await page.context().storageState({ path: storageStatePath(role) });
    };

    if (!credentialsFor(role)) {
      status.roles[role] = false;
      status.reasons[role] = `missing credentials for ${role}`;
      await persist();
      writeAuthStatus(status);
      return;
    }

    const assertNoRateLimit = trackRateLimits(page);
    let rateLimited = false;

    try {
      await loginAs(page, role);
      status.roles[role] = true;
      delete status.reasons[role];
    } catch (error) {
      status.roles[role] = false;
      const message = error instanceof Error ? error.message : "login failed";
      rateLimited = message.includes("429");
      status.reasons[role] = `login failed: ${message.split("\n")[0]}`;
    } finally {
      await persist();
      writeAuthStatus(status);
    }

    assertNoRateLimit();
    expect(
      rateLimited,
      `Sign-in for ${role} was rate limited by the app's auth limiter`
    ).toBe(false);

    // Only the credentials-present path reaches this line — a missing credential
    // returned early above. A rejected sign-in here used to be recorded in
    // status.json while the setup still reported "ok", which silently degraded
    // every dependent spec to a skip and hid the real cause. Fail loudly instead.
    expect(
      status.roles[role],
      `Sign-in for ${role} was rejected: ${status.reasons[role] ?? "unknown error"}. ` +
        "Credentials are present in .env.e2e.local, so this is a real failure — " +
        "repair the accounts with: npm run e2e:provision -- --yes"
    ).toBe(true);
  });
}