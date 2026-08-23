import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 180_000,
  fullyParallel: false,
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3110", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } }, { name: "mobile-chromium", use: { ...devices["Pixel 5"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : { command: "node node_modules/next/dist/bin/next dev -p 3110", url: "http://localhost:3110", reuseExistingServer: true, timeout: 120_000 },
});
