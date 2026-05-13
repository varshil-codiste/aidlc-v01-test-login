import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  testMatch: ['**/*.e2e.ts', '**/*.spec.ts'],
  fullyParallel: false, // auth tests share state (rate-limit map)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.FE_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile',  use: { ...devices['iPhone 13'] } },
  ],
});
