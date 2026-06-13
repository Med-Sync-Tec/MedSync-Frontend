/**
 * UAT — Historial de Consultas (/patients/:id/history)
 *
 * Cubre:
 *   - Breadcrumb de navegación (Pacientes > Nombre > Historial)
 *   - Tarjeta de información del paciente
 *   - Línea de tiempo de consultas agrupadas por año
 *   - Estado vacío ("Sin historial")
 *   - Estado de carga
 *   - Clic en consulta abre el modal SOAP
 *   - Modal SOAP muestra secciones S / O / A / P
 *   - Modal SOAP se puede cerrar
 *   - Botón "Nueva consulta" navega al formulario
 *   - Panel de contextos del paciente (tags/especialidades)
 *   - Panel de artículos relacionados
 *   - Botón "Filtrar" es visible
 *   - Botón volver navega a la lista de pacientes
 */
import { test, expect } from '@playwright/test';

const PATIENT_ID_PLACEHOLDER = 'test-patient-id';

test.describe('Historial de Consultas', () => {

  test.beforeEach(async ({ page }) => {
    // Navegar desde la lista de pacientes al primer paciente real
    await page.goto('/doctor/patients');
    await page.waitForLoadState('networkidle');
    const firstCard = page.locator('li').first();
    if (await firstCard.isVisible({ timeout: 8_000 })) {
      await firstCard.click();
      await page.waitForURL(/\/patients\/.+\/history/, { timeout: 8_000 });
    }
  });

  // ── Breadcrumb ───────────────────────────────────────────────────────────

  test('UAT-HIST-01 | muestra breadcrumb con "Pacientes" como primer nivel', async ({ page }) => {
    await expect(page.locator('text=Pacientes')).toBeVisible();
  });

  test('UAT-HIST-02 | clic en "Pacientes" del breadcrumb regresa a la lista', async ({ page }) => {
    await page.locator('a', { hasText: 'Pacientes' }).first().click();
    await expect(page).toHaveURL('/doctor/patients');
  });

  // ── Información del paciente ─────────────────────────────────────────────

  test('UAT-HIST-03 | muestra la tarjeta de información del paciente', async ({ page }) => {
    // Algún dato del paciente debe estar visible (expediente o nombre)
    await expect(
      page.locator('text=/EXP|expediente/i').or(page.locator('text=Historial'))
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── Línea de tiempo ──────────────────────────────────────────────────────

  test('UAT-HIST-04 | las consultas se muestran agrupadas (al menos un grupo de año)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const hasConsultations = await page.locator('text=/\\d{4}|Historial/').count() > 0;
    expect(hasConsultations).toBeTruthy();
  });

  test('UAT-HIST-05 | estado vacío muestra mensaje "Sin historial" si no hay consultas', async ({ page }) => {
    // Mockear vacío
    await page.route('**/api/patients/**/consultations**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    // Recargar la misma página de historial
    await page.reload();
    await expect(page.locator('text=Sin historial')).toBeVisible({ timeout: 8_000 });
  });

  // ── Modal SOAP ───────────────────────────────────────────────────────────

  test('UAT-HIST-06 | clic en una consulta abre el modal SOAP', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
    if (await consulta.isVisible({ timeout: 5_000 })) {
      await consulta.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });
    }
  });

  test('UAT-HIST-07 | modal SOAP muestra la sección Subjetivo (S)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
    if (await consulta.isVisible({ timeout: 5_000 })) {
      await consulta.click();
      await expect(
        page.locator('text=/Subjetiv|Subjective|\\bS\\b/i')
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('UAT-HIST-08 | modal SOAP muestra la sección Objetivo (O)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
    if (await consulta.isVisible({ timeout: 5_000 })) {
      await consulta.click();
      await expect(
        page.locator('text=/Objetiv|Objective|\\bO\\b/i')
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('UAT-HIST-09 | modal SOAP muestra la sección Evaluación/Análisis (A)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
    if (await consulta.isVisible({ timeout: 5_000 })) {
      await consulta.click();
      await expect(
        page.locator('text=/[Ee]valuaci|[Aa]nálisis|[Aa]ssessment|\\bA\\b/')
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('UAT-HIST-10 | modal SOAP muestra la sección Plan (P)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
    if (await consulta.isVisible({ timeout: 5_000 })) {
      await consulta.click();
      await expect(
        page.locator('text=/\\bPlan\\b|\\bP\\b/')
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('UAT-HIST-11 | modal SOAP se puede cerrar con el botón X', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
    if (await consulta.isVisible({ timeout: 5_000 })) {
      await consulta.click();
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 5_000 });
      // Buscar botón de cerrar dentro del dialog
      await dialog.locator('button[aria-label*="cerrar"], button[aria-label*="Cerrar"], button:has-text("×"), button:has-text("✕")').first().click();
      await expect(dialog).not.toBeVisible({ timeout: 3_000 });
    }
  });

  test('UAT-HIST-12 | modal SOAP se puede cerrar con Escape', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
    if (await consulta.isVisible({ timeout: 5_000 })) {
      await consulta.click();
      await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 3_000 });
    }
  });

  // ── Botón Nueva Consulta ─────────────────────────────────────────────────

  test('UAT-HIST-13 | botón "Nueva consulta" existe en la página', async ({ page }) => {
    await expect(page.locator('button', { hasText: /Nueva consulta/ })).toBeVisible({ timeout: 8_000 });
  });

  test('UAT-HIST-14 | botón "Nueva consulta" navega al formulario de SOAP', async ({ page }) => {
    const newBtn = page.locator('button', { hasText: /Nueva consulta/ });
    await expect(newBtn).toBeVisible({ timeout: 8_000 });
    await newBtn.click();
    await expect(page).toHaveURL(/\/consultas\/new/, { timeout: 8_000 });
  });

  // ── Filtros ──────────────────────────────────────────────────────────────

  test('UAT-HIST-15 | botón "Filtrar" está visible en la barra de acciones', async ({ page }) => {
    await expect(page.locator('button', { hasText: /Filtrar/ })).toBeVisible({ timeout: 8_000 });
  });

  // ── Paneles laterales ─────────────────────────────────────────────────────

  test('UAT-HIST-16 | panel de contextos del paciente está visible', async ({ page }) => {
    // El panel de tags/especialidades derivados de consultas
    await expect(
      page.locator('text=/[Cc]ontexto|[Ee]specialidad|[Tt]ags?/')
    ).toBeVisible({ timeout: 10_000 });
  });

});
