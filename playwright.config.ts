import { defineConfig, devices } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Minimal pre-launch browser smoke suite (Slice 4).
 *
 * Safety rules enforced here:
 *  - The app under test is always a LOCAL server. Nothing points at production.
 *  - Database fixtures are only created when E2E_DATABASE_URL names a dedicated
 *    database that is provably different from DATABASE_URL (see globalSetup).
 *  - Credentials come from the environment and are never printed.
 */

const root = resolve(__dirname);

function readEnvFile(file: string): Record<string, string> {
  const path = resolve(root, file);
  if (!existsSync(path)) return {};
  const out: Record<string, string> = {};
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv = { ...readEnvFile(".env"), ...readEnvFile(".env.e2e.local") };

const baseURL = fileEnv.E2E_BASE_URL || "http://localhost:3000";
const skipServer = process.env.E2E_SKIP_SERVER === "1" || Boolean(fileEnv.E2E_SKIP_SERVER);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // The app rate-limits /api/auth/* to 20 requests/minute per IP, so parallel
  // browser contexts would fight each other for the same budget.
  workers: 1,
  retries: 0,
  // The app renders against a remote database; first-load server rendering of a
  // course page takes tens of seconds, so browser budgets are generous.
  timeout: 120_000,
  expect: { timeout: 30_000 },
  globalSetup: "./e2e/global-setup.ts",
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 20_000,
    navigationTimeout: 90_000
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/
    },
    {
      name: "public",
      testMatch: /(public|auth)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: { cookies: [], origins: [] } }
    },
    {
      name: "authenticated",
      testMatch: /(student|instructor|admin|authorization|payment)\.spec\.ts/,
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: skipServer
    ? undefined
    : {
        command: "npm run build && npm run start",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 240_000,
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env, NODE_ENV: "production" }
      }
});