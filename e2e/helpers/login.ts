import type { Page } from '@playwright/test';

export const DOCTOR_EMAIL = process.env['TEST_DOCTOR_EMAIL'] ?? '';
export const DOCTOR_PASSWORD = process.env['TEST_DOCTOR_PASSWORD'] ?? '';
export const COO_EMAIL = process.env['TEST_COO_EMAIL'] ?? '';
export const COO_PASSWORD = process.env['TEST_COO_PASSWORD'] ?? '';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  // Wait for redirect away from login page
  await page.waitForURL(/(doctor|coo)\/dashboard/, { timeout: 15_000 });
}

export async function loginAsDoctor(page: Page) {
  await loginAs(page, DOCTOR_EMAIL, DOCTOR_PASSWORD);
}

export async function loginAsCoo(page: Page) {
  await loginAs(page, COO_EMAIL, COO_PASSWORD);
}
