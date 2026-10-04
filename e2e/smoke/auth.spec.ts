import { test, expect } from "@playwright/test";
import { loginAs, trackRateLimits } from "../support/auth";
import { requireRole } from "../support/gates";

/**
 * Journeys 4-6: authentication.
 *
 * Runs with no stored session (the `public` Playwright project starts with an
 * empty storage state) so the sign-in journey itself is genuinely exercised.
 */

test.describe("AUTH", () => {
  test("4. student can sign in and lands on the student dashboard", async ({ page }) => {
    requireRole("student");

    const assertNoRateLimit = trackRateLimits(page);

    await loginAs(page, "student");

    expect(new URL(page.url()).pathname).toBe("/dashboard");
    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();

    assertNoRateLimit();
  });

  test("5. student can sign out and loses protected access", async ({ page }) => {
    requireRole("student");

    await loginAs(page, "student");
    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();

    await page.locator('button[aria-label="Sign out"]').first().click();
    await page.waitForURL((url) => url.pathname === "/");

    await page.goto("/dashboard");
    await page.waitForURL((url) => url.pathname.startsWith("/login"));
    expect(new URL(page.url()).pathname).toBe("/login");
  });

  test("6. unauthenticated visitor is redirected away from protected pages", async ({ page }) => {
    for (const path of ["/dashboard", "/my-learning", "/instructor", "/admin"]) {
      await page.goto(path);
      await page.waitForURL((url) => url.pathname.startsWith("/login"), { timeout: 60_000 });
      expect(new URL(page.url()).pathname, `${path} should redirect to /login`).toBe("/login");
    }
  });
});