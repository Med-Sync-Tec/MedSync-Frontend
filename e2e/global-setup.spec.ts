/**
 * Global auth setup — runs once before all other tests.
 * Logs in as doctor and as COO, saves storage state so subsequent
 * tests can skip the login step entirely.
 */
import { test as setup } from '@playwright/test';
import { loginAsDoctor, loginAsCoo } from './helpers/login';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOCTOR_AUTH_FILE = path.join(__dirname, '.auth/doctor.json');
const COO_AUTH_FILE = path.join(__dirname, '.auth/coo.json');

setup('authenticate as doctor', async ({ page }) => {
  await loginAsDoctor(page);
  await page.context().storageState({ path: DOCTOR_AUTH_FILE });
});

setup('authenticate as COO', async ({ page }) => {
  await loginAsCoo(page);
  await page.context().storageState({ path: COO_AUTH_FILE });
});
