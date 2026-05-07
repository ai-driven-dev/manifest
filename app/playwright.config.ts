import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: 'npm run build && PORT=4321 HOST=127.0.0.1 node ./dist/server/entry.mjs',
        url: 'http://127.0.0.1:4321',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 812 } },
    },
  ],
});
