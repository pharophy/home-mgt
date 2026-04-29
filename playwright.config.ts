import { defineConfig } from "@playwright/test";

const manualServers = process.env.PW_MANUAL_SERVERS === "1";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry"
  },
  webServer: manualServers
    ? undefined
    : [
        {
          command: "scripts\\start-e2e-server.cmd",
          url: "http://127.0.0.1:3211/api/health",
          reuseExistingServer: false,
          timeout: 60_000
        },
        {
          command: "node scripts/start-e2e-client-server.mjs",
          url: "http://127.0.0.1:4173",
          reuseExistingServer: false,
          timeout: 60_000
        }
      ]
});
