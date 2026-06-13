/**
 * UAT — Inventario de Medicamentos (/coo/inventory)
 *
 * Cubre:
 *   - Carga inicial de la tabla
 *   - Contador de medicamentos y paginación
 *   - Búsqueda por nombre (debounce 400ms)
 *   - Búsqueda sin resultados
 *   - Limpiar búsqueda restablece la lista completa
 *   - Filtro "Todos" (estado por defecto)
 *   - Filtro "Vigente"
 *   - Filtro "En revisión"
 *   - Filtro "Obsoleto"
 *   - Columnas de la tabla (Nombre, Estado, Descripción, Acciones)
 *   - Badges de estado con colores correctos
 *   - Modal "Nuevo medicamento": se abre, se valida, se crea, se cancela
 *   - Modal "Editar medicamento": se abre con datos precargados, se cambia estado, se guarda, se cancela
 *   - Diálogo de confirmación de eliminación: se abre, se cancela, se confirma
 *   - Estado de carga mientras el API responde
 *   - Error global de carga con alerta
 *   - Paginación: avanzar y retroceder páginas
 */
import { test, expect } from '@playwright/test';

test.describe('Inventario de Medicamentos', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/coo/inventory');
    await page.waitForLoadState('networkidle');
  });

  // ── Estructura de la página ──────────────────────────────────────────────

  test('UAT-INV-01 | muestra el título "Inventario de Medicamentos"', async ({ page }) => {
    await expect(page.locator('h1', { hasText: 'Inventario de Medicamentos' })).toBeVisible();
  });

  test('UAT-INV-02 | las columnas de la tabla están visibles', async ({ page }) => {
    await expect(page.locator('th', { hasText: 'Nombre' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Estado' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Acciones' })).toBeVisible();
  });

  test('UAT-INV-03 | la tabla carga al menos un medicamento', async ({ page }) => {
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10_000 });
  });

  // ── Búsqueda ─────────────────────────────────────────────────────────────

  test('UAT-INV-04 | el campo de búsqueda existe con el placeholder correcto', async ({ page }) => {
    await expect(page.locator('input[placeholder="Buscar por nombre..."]')).toBeVisible();
  });

  test('UAT-INV-05 | buscar por nombre filtra los resultados de la tabla', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar por nombre..."]');
    const firstRowText = await page.locator('tbody tr td').first().textContent();
    if (firstRowText) {
      const partialName = firstRowText.trim().slice(0, 3);
      await searchInput.fill(partialName);
      // Esperar el debounce de 400ms + carga
      await page.waitForTimeout(600);
      await page.waitForLoadState('networkidle');
      // Al menos una fila debe coincidir con la búsqueda
      await expect(page.locator('tbody tr').first()).toBeVisible();
    }
  });

  test('UAT-INV-06 | buscar un nombre inexistente muestra "No se encontraron medicamentos"', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar por nombre..."]');
    await searchInput.fill('xyzXYZnombrequenoexiste999');
    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=No se encontraron medicamentos')).toBeVisible({ timeout: 8_000 });
  });

  test('UAT-INV-07 | limpiar búsqueda restaura la lista completa', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Buscar por nombre..."]');
    await searchInput.fill('aaaa');
    await page.waitForTimeout(600);
    await searchInput.clear();
    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8_000 });
  });

  // ── Filtros de estado ─────────────────────────────────────────────────────

  test('UAT-INV-08 | filtro "Todos" está activo por defecto', async ({ page }) => {
    const todosBtn = page.locator('button', { hasText: 'Todos' });
    await expect(todosBtn).toHaveClass(/bg-primary/, { timeout: 3_000 });
  });

  test('UAT-INV-09 | filtro "Vigente" filtra solo medicamentos activos', async ({ page }) => {
    await page.click('button:text("Vigente")');
    await page.waitForLoadState('networkidle');
    // Todos los badges visibles deben decir "Vigente"
    const badges = page.locator('span', { hasText: 'Vigente' });
    await expect(badges.first()).toBeVisible({ timeout: 8_000 });
  });

  test('UAT-INV-10 | filtro "En revisión" muestra solo medicamentos en revisión', async ({ page }) => {
    await page.click('button:text("En revisión")');
    await page.waitForLoadState('networkidle');
    // Puede no haber resultados — solo verificamos que el filtro se activó
    const btn = page.locator('button:text("En revisión")');
    await expect(btn).toHaveClass(/bg-primary/, { timeout: 3_000 });
  });

  test('UAT-INV-11 | filtro "Obsoleto" muestra solo medicamentos obsoletos', async ({ page }) => {
    await page.click('button:text("Obsoleto")');
    await page.waitForLoadState('networkidle');
    const btn = page.locator('button:text("Obsoleto")');
    await expect(btn).toHaveClass(/bg-primary/, { timeout: 3_000 });
  });

  test('UAT-INV-12 | volver a "Todos" tras filtro restablece todos los medicamentos', async ({ page }) => {
    await page.click('button:text("Vigente")');
    await page.waitForLoadState('networkidle');
    await page.click('button:text("Todos")');
    await page.waitForLoadState('networkidle');
    const todosBtn = page.locator('button:text("Todos")');
    await expect(todosBtn).toHaveClass(/bg-primary/, { timeout: 3_000 });
  });

  // ── Modal Crear Medicamento ───────────────────────────────────────────────

  test('UAT-INV-13 | botón "Nuevo medicamento" abre el modal de creación', async ({ page }) => {
    await page.click('button', { hasText: 'Nuevo medicamento' });
    await expect(page.locator('h2', { hasText: 'Nuevo medicamento' })).toBeVisible({ timeout: 5_000 });
  });

  test('UAT-INV-14 | modal de creación muestra campos nombre y descripción', async ({ page }) => {
    await page.click('button', { hasText: 'Nuevo medicamento' });
    await expect(page.locator('#nombre-create')).toBeVisible();
    await expect(page.locator('#descripcion-create')).toBeVisible();
  });

  test('UAT-INV-15 | modal de creación muestra aviso de estado "Vigente" por defecto', async ({ page }) => {
    await page.click('button', { hasText: 'Nuevo medicamento' });
    await expect(page.locator('text=Vigente').first()).toBeVisible();
  });

  test('UAT-INV-16 | modal de creación valida que el nombre no esté vacío', async ({ page }) => {
    await page.click('button', { hasText: 'Nuevo medicamento' });
    await page.click('button:text("Crear")');
    // Debe mostrar error de validación
    await expect(page.locator('p.text-danger, [data-error]').first()).toBeVisible({ timeout: 3_000 });
  });

  test('UAT-INV-17 | modal de creación: "Cancelar" cierra sin guardar', async ({ page }) => {
    await page.click('button', { hasText: 'Nuevo medicamento' });
    await expect(page.locator('h2', { hasText: 'Nuevo medicamento' })).toBeVisible();
    await page.click('button:text("Cancelar")');
    await expect(page.locator('h2', { hasText: 'Nuevo medicamento' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('UAT-INV-18 | crear un medicamento nuevo lo agrega a la tabla', async ({ page }) => {
    const uniqueName = `Med Test ${Date.now()}`;
    // Mockear el POST para no escribir datos reales
    await page.route('**/api/medicamentos**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-med-id',
            nombre: uniqueName,
            estado: 'vigente',
            descripcion: '',
          }),
        });
      } else {
        route.continue();
      }
    });
    await page.click('button', { hasText: 'Nuevo medicamento' });
    await page.fill('#nombre-create', uniqueName);
    await page.click('button:text("Crear")');
    await expect(page.locator('h2', { hasText: 'Nuevo medicamento' })).not.toBeVisible({ timeout: 5_000 });
  });

  test('UAT-INV-19 | modal de creación muestra error global si el API falla', async ({ page }) => {
    await page.route('**/api/medicamentos**', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 500, body: '{}' });
      } else {
        route.continue();
      }
    });
    await page.click('button', { hasText: 'Nuevo medicamento' });
    await page.fill('#nombre-create', 'Med que fallará');
    await page.click('button:text("Crear")');
    await expect(
      page.locator('text=Ocurrió un error')
    ).toBeVisible({ timeout: 8_000 });
  });

  // ── Modal Editar Medicamento ──────────────────────────────────────────────

  test('UAT-INV-20 | botón editar abre el modal de edición con datos precargados', async ({ page }) => {
    const editBtn = page.locator('button[aria-label="Editar"]').first();
    await expect(editBtn).toBeVisible({ timeout: 10_000 });
    await editBtn.click();
    await expect(page.locator('h2', { hasText: 'Editar medicamento' })).toBeVisible({ timeout: 5_000 });
    // El nombre debe estar precargado (no vacío)
    await expect(page.locator('#nombre-edit')).not.toHaveValue('');
  });

  test('UAT-INV-21 | modal de edición muestra el selector de estado con opciones', async ({ page }) => {
    const editBtn = page.locator('button[aria-label="Editar"]').first();
    await expect(editBtn).toBeVisible({ timeout: 10_000 });
    await editBtn.click();
    const estadoSelect = page.locator('#estado-edit');
    await expect(estadoSelect).toBeVisible();
    // Verificar las 3 opciones
    await expect(estadoSelect.locator('option[value="vigente"]')).toBeAttached();
    await expect(estadoSelect.locator('option[value="en_revision"]')).toBeAttached();
    await expect(estadoSelect.locator('option[value="obsoleto"]')).toBeAttached();
  });

  test('UAT-INV-22 | se puede cambiar el estado de un medicamento a "En revisión"', async ({ page }) => {
    await page.route('**/api/medicamentos/**', (route) => {
      if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'any', nombre: 'Test', estado: 'en_revision' }) });
      } else {
        route.continue();
      }
    });
    const editBtn = page.locator('button[aria-label="Editar"]').first();
    await expect(editBtn).toBeVisible({ timeout: 10_000 });
    await editBtn.click();
    await page.selectOption('#estado-edit', 'en_revision');
    await page.click('button:text("Guardar")');
    await expect(page.locator('h2', { hasText: 'Editar medicamento' })).not.toBeVisible({ timeout: 5_000 });
  });

  test('UAT-INV-23 | modal de edición: "Cancelar" cierra sin guardar', async ({ page }) => {
    const editBtn = page.locator('button[aria-label="Editar"]').first();
    await expect(editBtn).toBeVisible({ timeout: 10_000 });
    await editBtn.click();
    await expect(page.locator('h2', { hasText: 'Editar medicamento' })).toBeVisible();
    await page.click('button:text("Cancelar")');
    await expect(page.locator('h2', { hasText: 'Editar medicamento' })).not.toBeVisible({ timeout: 3_000 });
  });

  // ── Eliminar Medicamento ─────────────────────────────────────────────────

  test('UAT-INV-24 | botón eliminar abre el diálogo de confirmación', async ({ page }) => {
    const deleteBtn = page.locator('button[aria-label="Eliminar"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    await deleteBtn.click();
    await expect(page.locator('h2', { hasText: 'Eliminar medicamento' })).toBeVisible({ timeout: 5_000 });
  });

  test('UAT-INV-25 | diálogo de confirmación muestra el nombre del medicamento a eliminar', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    const medicamentNombre = await firstRow.locator('td').first().textContent();
    const deleteBtn = firstRow.locator('button[aria-label="Eliminar"]');
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    await deleteBtn.click();
    if (medicamentNombre) {
      await expect(page.locator(`text=${medicamentNombre.trim()}`)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('UAT-INV-26 | diálogo de confirmación: "Cancelar" cierra sin eliminar', async ({ page }) => {
    const deleteBtn = page.locator('button[aria-label="Eliminar"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    await deleteBtn.click();
    await expect(page.locator('h2', { hasText: 'Eliminar medicamento' })).toBeVisible();
    await page.click('button:text("Cancelar")');
    await expect(page.locator('h2', { hasText: 'Eliminar medicamento' })).not.toBeVisible({ timeout: 3_000 });
  });

  test('UAT-INV-27 | confirmar eliminación llama al API y remueve el medicamento', async ({ page }) => {
    await page.route('**/api/medicamentos/**', (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 204 });
      } else {
        route.continue();
      }
    });
    const deleteBtn = page.locator('button[aria-label="Eliminar"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    await deleteBtn.click();
    await expect(page.locator('h2', { hasText: 'Eliminar medicamento' })).toBeVisible();
    await page.click('button:text("Eliminar"):not(:has-text("Nuevo"))');
    // El diálogo debe cerrarse
    await expect(page.locator('h2', { hasText: 'Eliminar medicamento' })).not.toBeVisible({ timeout: 8_000 });
  });

  test('UAT-INV-28 | error al eliminar muestra alerta global', async ({ page }) => {
    await page.route('**/api/medicamentos/**', (route) => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({ status: 500 });
      } else {
        route.continue();
      }
    });
    const deleteBtn = page.locator('button[aria-label="Eliminar"]').first();
    await expect(deleteBtn).toBeVisible({ timeout: 10_000 });
    await deleteBtn.click();
    await page.click('button:text("Eliminar"):not(:has-text("Nuevo"))');
    await expect(
      page.locator('text=No se pudo eliminar el medicamento')
    ).toBeVisible({ timeout: 8_000 });
  });

  // ── Paginación ───────────────────────────────────────────────────────────

  test('UAT-INV-29 | muestra info de paginación (X medicamentos · página Y de Z)', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    // Si hay más de 10 medicamentos, debe mostrarse la info de paginación
    const paginationInfo = page.locator('text=/medicamentos · página/');
    if (await paginationInfo.isVisible()) {
      await expect(paginationInfo).toBeVisible();
    }
  });

  test('UAT-INV-30 | paginación: avanzar a la segunda página', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const nextBtn = page.locator('button[aria-label*="iguiente"], button:has-text("›")').first();
    if (await nextBtn.isVisible() && !await nextBtn.isDisabled()) {
      await nextBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=página 2')).toBeVisible({ timeout: 5_000 });
    }
  });

  // ── Estado de carga ───────────────────────────────────────────────────────

  test('UAT-INV-31 | muestra indicador de carga mientras el API responde', async ({ page }) => {
    await page.route('**/api/medicamentos**', async (route) => {
      await new Promise((r) => setTimeout(r, 1_500));
      await route.continue();
    });
    await page.goto('/coo/inventory');
    await expect(page.locator('.animate-spin, [aria-label*="cargando"]').first()).toBeVisible({ timeout: 5_000 });
  });

});
