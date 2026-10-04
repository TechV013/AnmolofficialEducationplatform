import { test, expect } from "@playwright/test";

/**
 * Journeys 1-3: public surface.
 * These are read-only and need no database fixtures.
 */

test.describe("PUBLIC", () => {
  test("1. homepage loads", async ({ page }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveTitle(/anmolofficials/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Unstoppable Learning");
  });

  test("2. courses page loads and lists course links", async ({ page }) => {
    const response = await page.goto("/courses");

    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { name: "Explore Courses" })).toBeVisible();
  });

  test("3. course details page loads from a course link", async ({ page }) => {
    await page.goto("/courses");

    const courseLink = page.locator('a[href^="/courses/"]').first();
    test.skip(
      (await courseLink.count()) === 0,
      "no published course available to open in this environment"
    );

    await courseLink.click();
    await page.waitForURL(/\/courses\/[^/]+$/);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What you'll learn" })).toBeVisible();
  });
});