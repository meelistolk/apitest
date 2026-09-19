import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'https://reqres.in/api/',
    extraHTTPHeaders: {
      'x-api-key': process.env.REQRES_API_KEY ?? '',
      'X-Reqres-Env': process.env.REQRES_ENV ?? 'prod',
    },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api',
    },
  ],
});
