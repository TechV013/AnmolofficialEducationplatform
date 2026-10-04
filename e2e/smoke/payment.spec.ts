import { test, expect } from "@playwright/test";
import { requirePayuSandbox, requireRole } from "../support/gates";

/**
 * Journey 18: payment flow.
 *
 * Hard rule: this spec never touches a live gateway. It runs only when
 * PAYU_ENV=TEST and sandbox credentials exist; otherwise it reports as skipped
 * with the reason. The full redirect to test.payu.in and the pay/callback legs
 * are deliberately NOT automated in this slice.
 */

test.describe("PAYMENT (sandbox only)", () => {
  test.beforeEach(() => {
    requirePayuSandbox();
    requireRole("student");
  });

  test("18. paid course exposes a checkout entry point", async ({ page, context }) => {
    await context.clearCookies();

    await page.goto("/courses");

    const courseLinks = page.locator('a[href^="/courses/"]');
    const total = await courseLinks.count();
    test.skip(total === 0, "no published course available to inspect");

    let sawCheckoutCta = false;

    for (let index = 0; index < Math.min(total, 5); index += 1) {
      await courseLinks.nth(index).click();
      await page.waitForURL(/\/courses\/[^/]+$/);

      const checkout = page.getByRole("button", { name: /Enroll Now|Start Learning/ });
      if ((await checkout.count()) > 0) {
        sawCheckoutCta = true;
        break;
      }

      await page.goBack();
      await page.waitForURL(/\/courses$/);
    }

    expect(
      sawCheckoutCta,
      "expected at least one published course to expose a checkout CTA"
    ).toBe(true);
  });
});