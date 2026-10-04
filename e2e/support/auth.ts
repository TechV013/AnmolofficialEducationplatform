import { expect, type Page } from "@playwright/test";
import { credentialsFor, type Role } from "./env";

/**
 * Auth helpers built on the CURRENT UI only — no test ids, no markup changes.
 *
 * The login form's <label> elements are not associated with their inputs, so
 * getByLabel() cannot address them. Placeholder + input[type=password] are the
 * only stable handles available without touching application components.
 */

export const ROUTE_AFTER_LOGIN: Record<Role, string> = {
  student: "/dashboard",
  instructor: "/instructor",
  admin: "/admin"
};

export function trackRateLimits(page: Page): () => void {
  const hits: string[] = [];
  page.on("response", (response) => {
    if (response.status() === 429) {
      hits.push(`${response.request().method()} ${response.url()} -> 429`);
    }
  });
  return () => {
    expect(
      hits,
      `Authentication rate limit tripped (20 req/min on /api/auth/*):\n${hits.join("\n")}`
    ).toEqual([]);
  };
}

export async function loginAs(page: Page, role: Role): Promise<void> {
  const credentials = credentialsFor(role);
  if (!credentials) {
    throw new Error(
      `No credentials available for role "${role}". Set E2E_${role.toUpperCase()}_EMAIL and E2E_${role.toUpperCase()}_PASSWORD (or the DEMO_*_PASSWORD equivalents).`
    );
  }

  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(credentials.email);
  await page.locator('input[type="password"]').fill(credentials.password);

  const submitted = page.waitForResponse(
    (response) => response.url().includes("/api/auth/callback/credentials"),
    { timeout: 60_000 }
  );

  await page.getByRole("button", { name: "Sign In" }).click();

  const response = await submitted;
  if (response.status() === 401) {
    throw new Error(
      `Credentials rejected (401) for ${credentials.email}. The account does not exist in the E2E database, has no password set, or the password is wrong.`
    );
  }

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 60_000 });
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 60_000 });
}

export async function expectRedirectedToLogin(page: Page): Promise<void> {
  await page.waitForURL((url) => url.pathname.startsWith("/login"), { timeout: 60_000 });
  expect(new URL(page.url()).pathname).toBe("/login");
}