import { test, expect } from "@playwright/test";
import { storageStatePath } from "../support/auth-status";
import { requireRole } from "../support/gates";

/**
 * Browser-level authorization smoke (journey group 7 of the brief).
 *
 * Wrong-role access must bounce to /login, because requireXOrRedirect() in the
 * (admin)/(instructor)/(student) layouts re-reads the role from the database.
 */

test.describe("role isolation", () => {
  test.describe("as student", () => {
    test.use({ storageState: storageStatePath("student") });
    test.beforeEach(() => requireRole("student"));

    test("student cannot open /admin", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForURL((url) => url.pathname.startsWith("/login"));

      expect(new URL(page.url()).pathname).toBe("/login");
    });

    test("student cannot open /instructor", async ({ page }) => {
      await page.goto("/instructor");
      await page.waitForURL((url) => url.pathname.startsWith("/login"));

      expect(new URL(page.url()).pathname).toBe("/login");
    });
  });

  test.describe("as instructor", () => {
    test.use({ storageState: storageStatePath("instructor") });
    test.beforeEach(() => requireRole("instructor"));

    test("instructor cannot open /admin", async ({ page }) => {
      await page.goto("/admin");
      await page.waitForURL((url) => url.pathname.startsWith("/login"));

      expect(new URL(page.url()).pathname).toBe("/login");
    });
  });
});