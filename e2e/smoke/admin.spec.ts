import { test, expect } from "@playwright/test";
import { loginAs, trackRateLimits } from "../support/auth";
import { storageStatePath } from "../support/auth-status";
import { requireRole } from "../support/gates";

/**
 * Journeys 16-17: administrator.
 */

test.describe("ADMIN login", () => {
  test("16. admin can sign in and lands on the admin dashboard", async ({ page }) => {
    requireRole("admin");

    const assertNoRateLimit = trackRateLimits(page);
    await loginAs(page, "admin");

    expect(new URL(page.url()).pathname).toBe("/admin");
    assertNoRateLimit();
  });
});

test.describe("ADMIN workspace", () => {
  test.use({ storageState: storageStatePath("admin") });
  test.beforeEach(() => requireRole("admin"));

  test("17. admin page loads", async ({ page }) => {
    const response = await page.goto("/admin");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  });
});