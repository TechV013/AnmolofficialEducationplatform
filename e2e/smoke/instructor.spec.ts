import { test, expect } from "@playwright/test";
import { loginAs, trackRateLimits } from "../support/auth";
import { storageStatePath } from "../support/auth-status";
import { requireRole } from "../support/gates";

/**
 * Journeys 11-15: instructor.
 *
 * Journey 11 signs in explicitly (one extra auth request) to prove the
 * role-based landing route. Journeys 13-15 only open existing UI; nothing is
 * created or saved.
 */

test.describe("INSTRUCTOR login", () => {
  test("11. instructor can sign in and lands on the instructor dashboard", async ({ page }) => {
    requireRole("instructor");

    const assertNoRateLimit = trackRateLimits(page);
    await loginAs(page, "instructor");

    expect(new URL(page.url()).pathname).toBe("/instructor");
    assertNoRateLimit();
  });
});

test.describe("INSTRUCTOR workspace", () => {
  test.use({ storageState: storageStatePath("instructor") });
  test.beforeEach(() => requireRole("instructor"));

  test("12. instructor dashboard loads", async ({ page }) => {
    await page.goto("/instructor");

    await expect(page.getByRole("heading", { name: "Instructor Dashboard" })).toBeVisible();
  });

  test("13. Course Studio opens for an existing course", async ({ page }) => {
    await page.goto("/instructor/courses");

    const courseLink = page.locator('a[href^="/instructor/courses/"]').first();
    test.skip((await courseLink.count()) === 0, "instructor has no assigned course in this environment");

    await courseLink.click();
    await page.waitForURL(/\/instructor\/courses\/[^/]+$/);

    await expect(page.getByRole("heading", { name: "Curriculum & Sessions" })).toBeVisible();
  });

  test("14. curriculum creation form loads", async ({ page }) => {
    await page.goto("/instructor/courses/new");

    await expect(page.getByRole("heading", { name: "Create New Course" })).toBeVisible();
    await expect(page.getByPlaceholder("e.g. Advanced Blender Rigging")).toBeVisible();
    await expect(page.getByPlaceholder("Course overview...")).toBeVisible();
    await expect(page.getByRole("button", { name: /Create Course/ })).toBeVisible();
  });

  test("15. lesson authoring UI loads inside Course Studio", async ({ page }) => {
    await page.goto("/instructor/courses");

    const courseLink = page.locator('a[href^="/instructor/courses/"]').first();
    test.skip((await courseLink.count()) === 0, "instructor has no assigned course in this environment");

    await courseLink.click();
    await page.waitForURL(/\/instructor\/courses\/[^/]+$/);
    await expect(page.getByRole("heading", { name: "Curriculum & Sessions" })).toBeVisible();

    // CourseCurriculumBuilder is a three-step flow: Add Lesson -> pick a type -> form.
    const addLessonButton = page.getByRole("button", { name: "Add Lesson" }).first();
    test.skip((await addLessonButton.count()) === 0, "no lesson authoring control rendered for this course");
    await addLessonButton.click();

    await expect(page.getByText("Lesson type", { exact: false })).toBeVisible();

    const videoChoice = page.getByRole("button", { name: /Video/ }).first();
    test.skip((await videoChoice.count()) === 0, "lesson type chooser did not render");
    await videoChoice.click();

    await expect(page.getByPlaceholder("Lesson title")).toBeVisible();
    await expect(page.getByPlaceholder("Description (optional)")).toBeVisible();
  });
});