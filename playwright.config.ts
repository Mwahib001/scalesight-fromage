import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 2,
  timeout: 45000,
  use: {
    baseURL: process.env.PREVIEW_URL ?? "http://127.0.0.1:3100",
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  webServer: process.env.PREVIEW_URL
    ? undefined
    : {
        command:
          "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 3100",
        url: "http://127.0.0.1:3100",
        reuseExistingServer: true,
        timeout: 60000,
      },
});
