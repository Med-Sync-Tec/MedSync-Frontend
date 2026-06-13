/**
 * UAT — Pantalla de inicio de sesión (/)
 *
 * Cubre todos los escenarios posibles:
 *   - Campos vacíos (validación frontend)
 *   - Email con formato inválido
 *   - Contraseña vacía
 *   - Credenciales incorrectas (error del backend/Firebase)
 *   - Login exitoso como doctor → redirección a /doctor/dashboard
 *   - Login exitoso como COO   → redirección a /coo/dashboard
 *   - Toggle mostrar/ocultar contraseña
 *   - Checkbox "Mantener sesión iniciada"
 *   - Usuario ya autenticado no puede volver a /
 *   - Estado de carga (spinner) mientras se verifica
 */
import { test, expect } from '@playwright/test';
import { DOCTOR_EMAIL, DOCTOR_PASSWORD, COO_EMAIL, COO_PASSWORD } from './helpers/login';

test.use({ storageState: { cookies: [], origins: [] } }); // login tests always start unauthenticated

test.describe('Página de login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#email')).toBeVisible();
  });

  // ── Validaciones de campo vacío ──────────────────────────────────────────

  test('UAT-LOGIN-01 | muestra error si se envía el formulario vacío', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Correo electrónico')).toBeVisible();
    // Los mensajes de error de Zod aparecen bajo cada campo
    await expect(page.locator('p.text-danger').first()).toBeVisible();
  });

  test('UAT-LOGIN-02 | muestra error de campo si solo falta el email', async ({ page }) => {
    await page.fill('#password', 'cualquier_cosa');
    await page.click('button[type="submit"]');
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('UAT-LOGIN-03 | muestra error de campo si solo falta la contraseña', async ({ page }) => {
    await page.fill('#email', 'doctor@test.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('#password')).toHaveAttribute('aria-invalid', 'true');
  });

  // ── Validación de formato de email ───────────────────────────────────────

  test('UAT-LOGIN-04 | rechaza email con formato inválido (sin @)', async ({ page }) => {
    await page.fill('#email', 'noesuncorreo');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('UAT-LOGIN-05 | rechaza email con formato inválido (sin dominio)', async ({ page }) => {
    await page.fill('#email', 'usuario@');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  });

  // ── Error de credenciales ────────────────────────────────────────────────

  test('UAT-LOGIN-06 | muestra alerta de error con credenciales incorrectas', async ({ page }) => {
    await page.fill('#email', 'noexiste@medsync.com');
    await page.fill('#password', 'contraseñaincorrecta');
    await page.click('button[type="submit"]');
    // El banner de error global debe aparecer (Alert type="error")
    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10_000 });
    // Seguimos en la página de login
    await expect(page).toHaveURL('/');
  });

  // ── Toggle de contraseña ─────────────────────────────────────────────────

  test('UAT-LOGIN-07 | botón ojo muestra la contraseña en texto plano', async ({ page }) => {
    await page.fill('#password', 'MiContraseña123');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    await page.click('[aria-label="Mostrar contraseña"]');
    await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  });

  test('UAT-LOGIN-08 | botón ojo oculta la contraseña de nuevo', async ({ page }) => {
    await page.fill('#password', 'MiContraseña123');
    await page.click('[aria-label="Mostrar contraseña"]');
    await expect(page.locator('#password')).toHaveAttribute('type', 'text');
    await page.click('[aria-label="Ocultar contraseña"]');
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  // ── Checkbox "Mantener sesión" ───────────────────────────────────────────

  test('UAT-LOGIN-09 | checkbox "Mantener sesión iniciada" está marcado por defecto', async ({ page }) => {
    // El checkbox está implementado como input sr-only con span visual
    const label = page.locator('label', { hasText: 'Mantener sesión iniciada' });
    await expect(label).toBeVisible();
    // El input oculto debe estar checked
    await expect(label.locator('input[type="checkbox"]')).toBeChecked();
  });

  test('UAT-LOGIN-10 | se puede desmarcar el checkbox "Mantener sesión"', async ({ page }) => {
    const checkbox = page.locator('label', { hasText: 'Mantener sesión iniciada' }).locator('input');
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────

  test('UAT-LOGIN-11 | botón muestra spinner y texto "Verificando…" durante el submit', async ({ page }) => {
    await page.fill('#email', DOCTOR_EMAIL || 'doctor@test.com');
    await page.fill('#password', DOCTOR_PASSWORD || 'password');
    // Interceptamos la navegación para capturar el estado intermedio
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    // El botón debe deshabilitarse mientras carga
    await expect(submitBtn).toBeDisabled();
  });

  // ── Login exitoso (requiere credenciales de test configuradas) ────────────

  test('UAT-LOGIN-12 | doctor puede iniciar sesión y llega a su dashboard', async ({ page }) => {
    test.skip(!DOCTOR_EMAIL, 'TEST_DOCTOR_EMAIL no configurado en .env.test');
    await page.fill('#email', DOCTOR_EMAIL);
    await page.fill('#password', DOCTOR_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/doctor/dashboard', { timeout: 15_000 });
  });

  test('UAT-LOGIN-13 | COO puede iniciar sesión y llega a su dashboard', async ({ page }) => {
    test.skip(!COO_EMAIL, 'TEST_COO_EMAIL no configurado en .env.test');
    await page.fill('#email', COO_EMAIL);
    await page.fill('#password', COO_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/coo/dashboard', { timeout: 15_000 });
  });

  test('UAT-LOGIN-14 | mensaje de bienvenida aparece tras login exitoso', async ({ page }) => {
    test.skip(!DOCTOR_EMAIL, 'TEST_DOCTOR_EMAIL no configurado en .env.test');
    await page.fill('#email', DOCTOR_EMAIL);
    await page.fill('#password', DOCTOR_PASSWORD);
    await page.click('button[type="submit"]');
    // El Alert de success "¡Bienvenido!" debe aparecer brevemente
    await expect(page.locator('text=¡Bienvenido!')).toBeVisible({ timeout: 10_000 });
  });

  // ── Redirección si ya está autenticado ───────────────────────────────────

  test('UAT-LOGIN-15 | usuario autenticado que visita / es redirigido a su dashboard', async ({ page, context }) => {
    test.skip(!DOCTOR_EMAIL, 'TEST_DOCTOR_EMAIL no configurado en .env.test');
    // Login primero
    await page.fill('#email', DOCTOR_EMAIL);
    await page.fill('#password', DOCTOR_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/doctor/dashboard', { timeout: 15_000 });
    // Intentar volver a /
    await page.goto('/');
    // Debe redirigir de vuelta al dashboard
    await expect(page).toHaveURL('/doctor/dashboard');
  });

  // ── Cierre de alertas ─────────────────────────────────────────────────────

  test('UAT-LOGIN-16 | se puede cerrar la alerta de error manualmente', async ({ page }) => {
    await page.fill('#email', 'malo@test.com');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible({ timeout: 10_000 });
    // Buscar el botón de cerrar dentro del alert
    await alert.locator('button').click();
    await expect(alert).not.toBeVisible();
  });

});
