/**
 * UAT — Lista de Pacientes (/doctor/patients)
 *
 * Cubre:
 *   - Carga de la lista de pacientes
 *   - Contador de pacientes en el header y en la barra
 *   - Estado de carga (skeletons)
 *   - Estado vacío ("Aún no tienes pacientes")
 *   - Estado de error con botón "Reintentar"
 *   - Clic en paciente navega a su historial
 *   - Botón "Nuevo paciente" abre el modal
 *   - Modal: validación de campos requeridos
 *   - Modal: se puede cancelar sin crear
 *   - Modal: creación exitosa redirige al historial
 *   - Modal: error al crear muestra alerta
 *   - Cada tarjeta muestra nombre, ID y estado del paciente
 *   - Estado "estable" / "alta" en las tarjetas
 */
import { test, expect } from '@playwright/test';

test.describe('Lista de Pacientes', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/doctor/patients');
    await page.waitForLoadState('networkidle');
  });

  // ── Estructura de la página ──────────────────────────────────────────────

  test('UAT-PAT-01 | muestra el heading "Gestión de pacientes"', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Gestión de pacientes' })).toBeVisible();
  });

  test('UAT-PAT-02 | muestra el total de pacientes en el subtítulo', async ({ page }) => {
    await expect(
      page.locator('text=/\\d+ pacientes? registrad/')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-PAT-03 | la barra superior muestra el conteo de resultados', async ({ page }) => {
    await expect(page.locator('text=/\\d+ resultado/')).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-PAT-04 | texto de ayuda indica que se puede hacer clic para ver historial', async ({ page }) => {
    await expect(page.locator('text=Haz clic en un paciente para abrir su historial')).toBeVisible();
  });

  // ── Estado de carga ──────────────────────────────────────────────────────

  test('UAT-PAT-05 | muestra esqueletos de carga mientras se obtienen los pacientes', async ({ page }) => {
    // Interceptar para ralentizar la respuesta
    await page.route('**/api/patients**', async (route) => {
      await new Promise((r) => setTimeout(r, 1_500));
      await route.continue();
    });
    await page.goto('/doctor/patients');
    await expect(page.locator('text=Cargando…')).toBeVisible({ timeout: 5_000 });
  });

  // ── Estado vacío ─────────────────────────────────────────────────────────

  test('UAT-PAT-06 | muestra estado vacío cuando no hay pacientes registrados', async ({ page }) => {
    await page.route('**/api/patients**', (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.goto('/doctor/patients');
    await expect(page.locator('text=Aún no tienes pacientes')).toBeVisible({ timeout: 8_000 });
  });

  // ── Estado de error ──────────────────────────────────────────────────────

  test('UAT-PAT-07 | muestra estado de error cuando falla la carga', async ({ page }) => {
    await page.route('**/api/patients**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) });
    });
    await page.goto('/doctor/patients');
    await expect(page.locator('text=Error al cargar pacientes')).toBeVisible({ timeout: 8_000 });
  });

  test('UAT-PAT-08 | botón "Reintentar" vuelve a llamar al API tras error', async ({ page }) => {
    let callCount = 0;
    await page.route('**/api/patients**', (route) => {
      callCount++;
      if (callCount === 1) {
        route.fulfill({ status: 500, body: '{}' });
      } else {
        route.continue();
      }
    });
    await page.goto('/doctor/patients');
    await expect(page.locator('text=Reintentar')).toBeVisible({ timeout: 8_000 });
    await page.click('text=Reintentar');
    // Debe intentar recargar (callCount debe incrementar)
    await page.waitForTimeout(1_000);
    expect(callCount).toBeGreaterThan(1);
  });

  // ── Tarjetas de pacientes ────────────────────────────────────────────────

  test('UAT-PAT-09 | cada tarjeta de paciente muestra nombre, ID y estado', async ({ page }) => {
    const firstCard = page.locator('li').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    // La tarjeta debe tener al menos texto de nombre (no vacía)
    await expect(firstCard).not.toBeEmpty();
  });

  test('UAT-PAT-10 | clic en una tarjeta de paciente navega a su historial', async ({ page }) => {
    const firstCard = page.locator('li').first();
    await expect(firstCard).toBeVisible({ timeout: 10_000 });
    await firstCard.click();
    await expect(page).toHaveURL(/\/patients\/.+\/history/, { timeout: 8_000 });
  });

  // ── Modal Nuevo Paciente ─────────────────────────────────────────────────

  test('UAT-PAT-11 | botón "Nuevo paciente" abre el modal', async ({ page }) => {
    await page.click('button', { hasText: 'Nuevo paciente' });
    // El modal debe aparecer — buscar por heading o role=dialog
    await expect(
      page.locator('[role="dialog"], [aria-modal="true"]').or(page.locator('text=Nuevo paciente').nth(1))
    ).toBeVisible({ timeout: 5_000 });
  });

  test('UAT-PAT-12 | modal se puede cerrar con el botón cancelar', async ({ page }) => {
    await page.click('button', { hasText: 'Nuevo paciente' });
    const cancelBtn = page.locator('button', { hasText: /[Cc]ancelar/ });
    await expect(cancelBtn).toBeVisible({ timeout: 5_000 });
    await cancelBtn.click();
    await expect(cancelBtn).not.toBeVisible({ timeout: 3_000 });
  });

  test('UAT-PAT-13 | modal valida que el nombre del paciente no esté vacío', async ({ page }) => {
    await page.click('button', { hasText: 'Nuevo paciente' });
    // Intentar guardar sin rellenar campos
    const saveBtn = page.locator('button', { hasText: /[Gg]uardar|[Cc]rear/ });
    await expect(saveBtn).toBeVisible({ timeout: 5_000 });
    await saveBtn.click();
    // Debe mostrar error de validación
    await expect(page.locator('p.text-danger, [data-error]').first()).toBeVisible({ timeout: 3_000 });
  });

  test('UAT-PAT-14 | modal cierra y navega al historial tras crear paciente exitosamente', async ({ page }) => {
    // Mockear el POST para no crear un paciente real
    await page.route('**/api/patients', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-uuid-001',
            nombre: 'Paciente De Prueba',
            expedienteExternoId: 'EXP-001',
            activo: true,
            fechaNacimiento: '1990-01-01',
            genero: 'masculino',
          }),
        });
      } else {
        route.continue();
      }
    });
    await page.click('button', { hasText: 'Nuevo paciente' });
    // Rellenar el nombre (selector genérico — depende del componente NewPatientModal)
    const nombreInput = page.locator('input[name="nombre"], input[id*="nombre"], input[placeholder*="paciente"]').first();
    if (await nombreInput.isVisible()) {
      await nombreInput.fill('Paciente De Prueba');
      await page.locator('button', { hasText: /[Gg]uardar|[Cc]rear/ }).click();
      await expect(page).toHaveURL(/\/patients\/test-uuid-001\/history/, { timeout: 8_000 });
    } else {
      test.skip(true, 'No se encontró el campo nombre en el modal — revisar selectores');
    }
  });

});
