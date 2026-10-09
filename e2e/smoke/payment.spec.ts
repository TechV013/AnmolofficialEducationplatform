import { test, expect } from "@playwright/test";
import { requirePayuSandbox, requireRole, requireWriteJourneys } from "../support/gates";
import { storageStatePath } from "../support/auth-status";

/**
 * Journey 18/19: payment flow.
 *
 * Hard rule: this spec never reaches a live gateway. It runs only when
 * PAYU_ENV=TEST and sandbox credentials exist; otherwise it reports as skipped
 * with the reason (requirePayuSandbox).
 *
 * 18 is read-only: it proves a published course exposes an enroll CTA.
 * 19 proves the browser actually POSTs the signed form to test.payu.in, which is
 * the assertion that would catch PAYU_ENV pointing at secure.payu.in. Rendering
 * that form runs a server action that creates an Order row, so 19 is additionally
 * gated on a dedicated E2E database (requireWriteJourneys) — it must never write
 * orders into the application's own database.
 *
 * Navigation is hard (page.goto) rather than click/goBack: the app router's
 * client-side transition resolves waitForURL before React commits, so a
 * non-waiting locator count reads 0 on a page that does contain the CTA.
 */

const SANDBOX_GATEWAY = "https://test.payu.in/_payment";
const CTA = /Enroll Now|Start Learning/;

async function courseHrefs(page: import("@playwright/test").Page): Promise<string[]> {
  await page.goto("/courses");
  return page.locator('a[href^="/courses/"]').evaluateAll((elements) =>
    [...new Set(elements.map((element) => element.getAttribute("href")))].filter(
      (href): href is string => Boolean(href)
    )
  );
}

test.describe("PAYMENT (sandbox only)", () => {
  test.use({ storageState: storageStatePath("student") });

  test.beforeEach(() => {
    requirePayuSandbox();
    requireRole("student");
  });

  test("18. paid course exposes a checkout entry point", async ({ page, context }) => {
    await context.clearCookies();

    const hrefs = await courseHrefs(page);
    test.skip(hrefs.length === 0, "no published course available to inspect");

    const inspected: string[] = [];
    let foundCta = false;

    for (const href of hrefs.slice(0, 5)) {
      await page.goto(href);
      const checkout = page.getByRole("button", { name: CTA }).first();
      inspected.push(href);

      try {
        await checkout.waitFor({ state: "visible", timeout: 15_000 });
        foundCta = true;
        break;
      } catch {
        // No CTA on this course — try the next one, then fail with context.
      }
    }

    expect(
      foundCta,
      `expected at least one published course to expose a checkout CTA; inspected ${inspected.length} course(s): ${inspected.join(", ")}`
    ).toBe(true);
  });

  test("19. checkout form posts to test.payu.in", async ({ page }) => {
    requireWriteJourneys();

    const posted: { url: string; method: string }[] = [];
    page.on("request", (request) => {
      if (request.url().includes("payu.in")) {
        posted.push({ url: request.url(), method: request.method() });
      }
    });
    // EnrollButton submits its signed form from a useEffect the moment the server
    // action resolves, so the gateway target is observed as an issued request.
    // Abort it: the test proves where checkout would go, it does not open a
    // hosted payment page.
    await page.route(/payu\.in/, (route) => route.abort());

    const hrefs = await courseHrefs(page);
    test.skip(hrefs.length === 0, "no published course available to inspect");

    let startedCheckout = false;

    for (const href of hrefs.slice(0, 5)) {
      await page.goto(href);

      // "Start Learning" enrolls into a free course and never reaches PayU.
      const enrollNow = page.getByRole("button", { name: "Enroll Now" }).first();
      try {
        await enrollNow.waitFor({ state: "visible", timeout: 15_000 });
      } catch {
        continue;
      }

      await enrollNow.click();
      startedCheckout = true;
      break;
    }

    test.skip(!startedCheckout, "no paid course with an available checkout CTA found");

    await expect
      .poll(() => posted[0], {
        timeout: 30_000,
        message: "expected the checkout form to POST to the PayU sandbox gateway"
      })
      .toEqual({ url: SANDBOX_GATEWAY, method: "POST" });
  });
});
