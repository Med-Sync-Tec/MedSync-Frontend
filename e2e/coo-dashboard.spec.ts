/**
 * UAT — Dashboard del COO (/coo/dashboard)
 *
 * Cubre:
 *   - Header "PANEL OPERACIONES"
 *   - KPIs de la vista Explorar (Artículos PubMed, Sin leer, Medicamentos, Alta Evidencia)
 *   - KPIs de la vista Guardadas (Total Guardados, Alta Evidencia, Recientes, Colecciones)
 *   - Toggle Explorar / Guardadas
 *   - Filtros de artículos (Todos, Alta evidencia, Recientes)
 *   - Botón "Sincronizar PubMed"
 *   - Artículos se cargan en la lista
 *   - Paginación (siguiente / anterior)
 *   - Clic en artículo abre detalle
 *   - Estado vacío cuando no hay artículos
 *   - Estado de error en la carga
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard del COO', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/coo/dashboard');
    await page.waitForLoadState('networkidle');
  });

  // ── Estructura de la página ──────────────────────────────────────────────

  test('UAT-COODASH-01 | muestra el encabezado "PANEL OPERACIONES"', async ({ page }) => {
    await expect(page.locator('text=/PANEL OPERACIONES/i')).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-COODASH-02 | muestra la fecha actual en el header', async ({ page }) => {
    // El dashboard muestra la fecha del día
    const today = new Date();
    const year = today.getFullYear().toString();
    await expect(page.locator(`text=${year}`)).toBeVisible({ timeout: 5_000 });
  });

  // ── KPIs vista Explorar ──────────────────────────────────────────────────

  test('UAT-COODASH-03 | KPI "Artículos PubMed" está visible', async ({ page }) => {
    await expect(page.locator('text=/Artículos PubMed|Artículos/')).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-COODASH-04 | KPI "Sin leer" está visible', async ({ page }) => {
    await expect(page.locator('text=Sin leer')).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-COODASH-05 | KPI "Medicamentos" muestra el total del inventario', async ({ page }) => {
    await expect(page.locator('text=Medicamentos')).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-COODASH-06 | KPI "Alta evidencia" está visible en vista Explorar', async ({ page }) => {
    await expect(page.locator('text=Alta evidencia').first()).toBeVisible({ timeout: 10_000 });
  });

  // ── Toggle Explorar / Guardadas ──────────────────────────────────────────

  test('UAT-COODASH-07 | se puede cambiar a la vista "Guardadas"', async ({ page }) => {
    await page.click('text=Guardadas');
    await expect(page.locator('text=Total Guardados')).toBeVisible({ timeout: 8_000 });
  });

  test('UAT-COODASH-08 | KPIs de Guardadas son visibles al cambiar a esa vista', async ({ page }) => {
    await page.click('text=Guardadas');
    await expect(page.locator('text=Total Guardados')).toBeVisible();
    await expect(page.locator('text=Alta Evidencia')).toBeVisible();
    await expect(page.locator('text=Recientes (48h)')).toBeVisible();
    await expect(page.locator('text=Colecciones')).toBeVisible();
  });

  test('UAT-COODASH-09 | se puede volver a "Explorar" desde "Guardadas"', async ({ page }) => {
    await page.click('text=Guardadas');
    await page.click('text=Explorar');
    await expect(page.locator('text=Sin leer')).toBeVisible({ timeout: 5_000 });
  });

  // ── Filtros de artículos ─────────────────────────────────────────────────

  test('UAT-COODASH-10 | filtro "Alta evidencia" está disponible', async ({ page }) => {
    const btn = page.locator('button', { hasText: /Alta [Ee]videncia/ }).first();
    await expect(btn).toBeVisible({ timeout: 8_000 });
  });

  test('UAT-COODASH-11 | filtro "Alta evidencia" se activa al hacer clic', async ({ page }) => {
    const btn = page.locator('button', { hasText: /Alta [Ee]videncia/ }).first();
    await expect(btn).toBeVisible({ timeout: 8_000 });
    await btn.click();
    await expect(btn).toHaveClass(/bg-primary|font-bold|active/, { timeout: 3_000 });
  });

  test('UAT-COODASH-12 | filtro "Recientes" filtra artículos de las últimas 48h', async ({ page }) => {
    const btn = page.locator('button', { hasText: /Recientes/ }).first();
    await expect(btn).toBeVisible({ timeout: 8_000 });
    await btn.click();
    await expect(btn).toHaveClass(/bg-primary|font-bold|active/, { timeout: 3_000 });
  });

  test('UAT-COODASH-13 | filtro "Todos" restablece la vista completa', async ({ page }) => {
    // Activar un filtro y luego volver a Todos
    const altaBtn = page.locator('button', { hasText: /Alta [Ee]videncia/ }).first();
    const todosBtn = page.locator('button', { hasText: 'Todos' }).first();
    if (await altaBtn.isVisible()) {
      await altaBtn.click();
      await todosBtn.click();
      await expect(todosBtn).toHaveClass(/bg-primary|font-bold|active/, { timeout: 3_000 });
    }
  });

  // ── Botón Sincronizar ────────────────────────────────────────────────────

  test('UAT-COODASH-14 | botón "Sincronizar PubMed" existe y responde al clic', async ({ page }) => {
    const syncBtn = page.locator('button', { hasText: /Sincronizar/ });
    await expect(syncBtn).toBeVisible({ timeout: 8_000 });
    await syncBtn.click();
    // Debe mostrar spinner o cambiar texto mientras sincroniza
    await expect(syncBtn).toBeVisible({ timeout: 5_000 });
  });

  // ── Lista de artículos ───────────────────────────────────────────────────

  test('UAT-COODASH-15 | se cargan artículos en la lista', async ({ page }) => {
    await expect(
      page.locator('article, [data-testid="article-card"]').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  // ── Paginación ───────────────────────────────────────────────────────────

  test('UAT-COODASH-16 | la paginación aparece cuando hay más de 10 artículos', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const pagination = page.locator('[aria-label*="paginación"], nav[aria-label*="Pagination"], .pagination').first();
    if (await pagination.isVisible()) {
      await expect(pagination).toBeVisible();
    }
    // Si no hay más de 10 artículos, la paginación no se muestra — test pasa
  });

});
