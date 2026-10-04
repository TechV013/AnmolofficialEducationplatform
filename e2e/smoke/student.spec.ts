import { test, expect, type Page } from "@playwright/test";
import { storageStatePath } from "../support/auth-status";
import { requireRole } from "../support/gates";

/**
 * Journeys 7-10: signed-in student.
 *
 * /my-learning links directly to /classroom/{courseId}/{lessonId} (see
 * src/app/(student)/my-learning/page.tsx:45). Opening a course, a classroom and
 * moving between lessons are read operations: nothing here marks a lesson
 * complete, so no LessonProgress rows are written.
 */

async function firstClassroomHref(page: Page): Promise<string | null> {
  await page.goto("/my-learning");
  await expect(page.getByRole("heading", { name: "My Learning" })).toBeVisible();

  const link = page.locator('a[href^="/classroom/"]').first();
  if ((await link.count()) === 0) return null;
  return link.getAttribute("href");
}

test.describe("STUDENT", () => {
  test.use({ storageState: storageStatePath("student") });
  test.beforeEach(() => requireRole("student"));

  test("7. student dashboard loads", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: /Welcome back/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My Courses" })).toBeVisible();
  });

  test("8. enrolled course opens from My Learning", async ({ page }) => {
    const href = await firstClassroomHref(page);
    test.skip(href === null, "student has no enrollment in this environment");

    const courseId = href!.split("/")[2];
    await page.goto(`/courses/${courseId}`);

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What you'll learn" })).toBeVisible();
  });

  test("9. classroom opens with a valid lesson", async ({ page }) => {
    const href = await firstClassroomHref(page);
    test.skip(href === null, "no classroom link (student has no enrolled course with lessons)");

    await page.goto(href!);
    await page.waitForURL(/\/classroom\/[^/]+/);

    await expect(page.getByRole("button", { name: /Mark as Complete|Lesson Completed/ })).toBeVisible();
  });

  test("10. lesson navigation moves between lessons", async ({ page }) => {
    const href = await firstClassroomHref(page);
    test.skip(href === null, "no classroom link (student has no enrolled course with lessons)");

    await page.goto(href!);
    await page.waitForURL(/\/classroom\/[^/]+/);

    const lessonLinks = page.locator('a[href^="/classroom/"]');
    const hrefs = await lessonLinks.evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href") ?? "")
    );
    const current = new URL(page.url()).pathname;
    const other = hrefs.find((candidate) => candidate && candidate !== current);
    test.skip(!other, "course exposes only the current lesson, so navigation cannot be asserted");

    await page.locator(`a[href="${other}"]`).first().click();
    await page.waitForURL((url) => url.pathname !== current);

    await expect(page.getByRole("button", { name: /Mark as Complete|Lesson Completed/ })).toBeVisible();
  });
});