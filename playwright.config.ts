import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
config({ path: '.env.test' });

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],

  use: {
    baseURL: process.env['BASE_URL'] ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
  },

  projects: [
    // Setup: logs in as doctor and COO, saves auth state to disk
    {
      name: 'setup',
      testMatch: '**/global-setup.spec.ts',
    },
    // Doctor tests reuse saved doctor session
    {
      name: 'doctor',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/doctor.json',
      },
      testMatch: ['**/login.spec.ts', '**/doctor-*.spec.ts', '**/patients-*.spec.ts', '**/consultation-*.spec.ts', '**/medibot.spec.ts', '**/navigation.spec.ts'],
    },
    // COO tests reuse saved COO session
    {
      name: 'coo',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/coo.json',
      },
      testMatch: ['**/coo-*.spec.ts', '**/inventory.spec.ts'],
    },
  ],

  // Only start dev server when testing locally (not needed for cloud URL)
  ...(process.env['BASE_URL']?.includes('localhost') || !process.env['BASE_URL'] ? {
    webServer: {
      command: 'pnpm dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  } : {}),
});
