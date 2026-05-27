import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    // The app is statically exported (`output: "export"`), so `next start` is
    // not usable and the home page hits the next/image dev-mode error. Probe a
    // page that renders cleanly so the readiness check doesn't get stuck on it.
    url: `${baseURL}/onboarding`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
