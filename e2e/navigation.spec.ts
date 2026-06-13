/**
 * UAT — Header y Navegación (transversal a todas las páginas)
 *
 * Cubre:
 *   - Logo MedSync visible y navega al home según rol
 *   - Links de navegación del doctor (Inicio, Pacientes)
 *   - Links de navegación del COO (Inicio, Por Medicamento, Inventario, Médicos)
 *   - Link activo tiene el indicador visual correcto
 *   - Nombre y email del usuario en el header
 *   - Menú de usuario se abre al hacer clic en el avatar
 *   - Menú de usuario: opción "Perfil"
 *   - Menú de usuario: opción "Cerrar sesión" desloguea y redirige a /
 *   - Menú de usuario se cierra al hacer clic fuera
 *   - Toggle de tema claro/oscuro funciona
 *   - El tema persiste en localStorage
 *   - Menú móvil se abre con el botón hamburguesa
 *   - Menú móvil se cierra con el botón X
 *   - Menú móvil cierra al navegar a otro link
 *   - Ctrl+K enfoca el campo de búsqueda global
 *   - Búsqueda global muestra resultados
 *   - Escape cierra el menú de usuario
 *   - Header es sticky (permanece al hacer scroll)
 */
import { test, expect } from '@playwright/test';

test.describe('Header y Navegación — Doctor', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/doctor/dashboard');
    await page.waitForLoadState('networkidle');
  });

  // ── Logo ─────────────────────────────────────────────────────────────────

  test('UAT-NAV-01 | logo "MedSync" es visible en el header', async ({ page }) => {
    await expect(page.locator('header a', { hasText: 'MedSync' })).toBeVisible();
  });

  test('UAT-NAV-02 | clic en el logo redirige al dashboard del doctor', async ({ page }) => {
    await page.goto('/doctor/patients');
    await page.click('header a[aria-label*="MedSync"]');
    await expect(page).toHaveURL('/doctor/dashboard');
  });

  // ── Links de navegación ──────────────────────────────────────────────────

  test('UAT-NAV-03 | el link "Inicio" está visible en la navegación principal', async ({ page }) => {
    await expect(page.locator('nav a', { hasText: 'Inicio' }).first()).toBeVisible();
  });

  test('UAT-NAV-04 | el link "Pacientes" está visible en la navegación principal', async ({ page }) => {
    await expect(page.locator('nav a', { hasText: 'Pacientes' }).first()).toBeVisible();
  });

  test('UAT-NAV-05 | clic en "Pacientes" navega a /doctor/patients', async ({ page }) => {
    await page.click('nav a[href="/doctor/patients"]');
    await expect(page).toHaveURL('/doctor/patients');
  });

  test('UAT-NAV-06 | clic en "Inicio" regresa al dashboard', async ({ page }) => {
    await page.goto('/doctor/patients');
    await page.click('nav a[href="/doctor/dashboard"]');
    await expect(page).toHaveURL('/doctor/dashboard');
  });

  test('UAT-NAV-07 | el link activo tiene el indicador visual (subrayado)', async ({ page }) => {
    // En /doctor/dashboard, "Inicio" debe estar activo
    const inicioLink = page.locator('nav a[aria-current="page"]');
    await expect(inicioLink).toBeVisible();
    // El span indicador (línea bajo el link activo)
    await expect(inicioLink.locator('span[aria-hidden="true"]')).toBeVisible();
  });

  // ── Menú de usuario ───────────────────────────────────────────────────────

  test('UAT-NAV-08 | el nombre del usuario aparece en el header', async ({ page }) => {
    // El botón de avatar muestra el nombre
    const userBtn = page.locator('button[aria-haspopup="menu"]');
    await expect(userBtn).toBeVisible();
    await expect(userBtn.locator('span.font-semibold')).toBeVisible();
  });

  test('UAT-NAV-09 | clic en el avatar abre el menú de usuario', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    await expect(page.locator('[role="menu"]')).toBeVisible({ timeout: 3_000 });
  });

  test('UAT-NAV-10 | menú de usuario muestra el nombre y email del usuario', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    const menu = page.locator('[role="menu"]');
    await expect(menu).toBeVisible();
    // El menú tiene una sección con nombre y email
    await expect(menu.locator('p.text-sm.font-semibold')).toBeVisible();
    await expect(menu.locator('p.text-xs')).toBeVisible();
  });

  test('UAT-NAV-11 | menú de usuario tiene la opción "Perfil"', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    await expect(page.locator('[role="menuitem"]', { hasText: 'Perfil' })).toBeVisible();
  });

  test('UAT-NAV-12 | clic en "Perfil" navega a la página de perfil', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    await page.click('[role="menuitem"]:has-text("Perfil")');
    await expect(page).toHaveURL(/\/doctor\/profile/);
  });

  test('UAT-NAV-13 | menú de usuario tiene el botón "Cerrar sesión"', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    await expect(page.locator('[role="menuitem"]', { hasText: 'Cerrar sesión' })).toBeVisible();
  });

  test('UAT-NAV-14 | "Cerrar sesión" desloguea al usuario y redirige a /', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    await page.click('[role="menuitem"]:has-text("Cerrar sesión")');
    await expect(page).toHaveURL('/', { timeout: 5_000 });
    // La página de login debe estar visible
    await expect(page.locator('#email')).toBeVisible({ timeout: 5_000 });
  });

  test('UAT-NAV-15 | menú de usuario se cierra al hacer clic fuera de él', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    await expect(page.locator('[role="menu"]')).toBeVisible();
    // Hacer clic en algún lugar fuera del menú
    await page.click('h1, main', { force: true });
    await expect(page.locator('[role="menu"]')).not.toBeVisible({ timeout: 3_000 });
  });

  test('UAT-NAV-16 | Escape cierra el menú de usuario', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    await expect(page.locator('[role="menu"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="menu"]')).not.toBeVisible({ timeout: 3_000 });
  });

  // ── Toggle de tema ────────────────────────────────────────────────────────

  test('UAT-NAV-17 | botón de toggle de tema está visible en pantallas medianas y grandes', async ({ page }) => {
    // Viewport desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(
      page.locator('button[aria-label*="modo"], button[aria-label*="Activar"]')
    ).toBeVisible();
  });

  test('UAT-NAV-18 | toggle de tema cambia entre claro y oscuro', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const themeBtn = page.locator('button[aria-label*="modo"], button[aria-label*="Activar"]').first();
    const initialLabel = await themeBtn.getAttribute('aria-label');
    await themeBtn.click();
    const newLabel = await themeBtn.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });

  test('UAT-NAV-19 | el tema oscuro aplica la clase "dark" en el elemento html', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Activar modo oscuro si no está activo
    const html = page.locator('html');
    const isDark = (await html.getAttribute('class'))?.includes('dark') ?? false;
    if (!isDark) {
      await page.click('button[aria-label*="Activar modo oscuro"]');
    }
    await expect(html).toHaveClass(/dark/, { timeout: 3_000 });
  });

  test('UAT-NAV-20 | el tema persiste en localStorage tras cambio', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.click('button[aria-label*="Activar"]');
    await page.waitForTimeout(300);
    const stored = await page.evaluate(() => localStorage.getItem('medsync-theme'));
    expect(stored).toBeTruthy();
  });

  // ── Menú móvil ────────────────────────────────────────────────────────────

  test('UAT-NAV-21 | botón hamburguesa está visible en viewport móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/doctor/dashboard');
    await expect(page.locator('button[aria-label="Abrir menú"]')).toBeVisible();
  });

  test('UAT-NAV-22 | clic en hamburguesa abre el menú de navegación móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/doctor/dashboard');
    await page.click('button[aria-label="Abrir menú"]');
    await expect(page.locator('nav[aria-label="Navegación móvil"]')).toBeVisible({ timeout: 3_000 });
  });

  test('UAT-NAV-23 | clic en X cierra el menú de navegación móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/doctor/dashboard');
    await page.click('button[aria-label="Abrir menú"]');
    await expect(page.locator('nav[aria-label="Navegación móvil"]')).toBeVisible();
    await page.click('button[aria-label="Cerrar menú"]');
    await expect(page.locator('nav[aria-label="Navegación móvil"]')).not.toBeVisible({ timeout: 3_000 });
  });

  test('UAT-NAV-24 | navegar desde el menú móvil cierra el menú', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/doctor/dashboard');
    await page.click('button[aria-label="Abrir menú"]');
    await expect(page.locator('nav[aria-label="Navegación móvil"]')).toBeVisible();
    await page.click('nav[aria-label="Navegación móvil"] a', { hasText: 'Pacientes' });
    await expect(page.locator('nav[aria-label="Navegación móvil"]')).not.toBeVisible({ timeout: 3_000 });
  });

  // ── Búsqueda global ──────────────────────────────────────────────────────

  test('UAT-NAV-25 | Ctrl+K enfoca el campo de búsqueda global', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
    await expect(searchInput).toBeFocused({ timeout: 3_000 });
  });

  // ── Sticky header ─────────────────────────────────────────────────────────

  test('UAT-NAV-26 | el header permanece visible al hacer scroll hacia abajo', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 1000));
    await expect(page.locator('header').first()).toBeVisible();
  });

});

// ── COO navigation ────────────────────────────────────────────────────────

test.describe('Header y Navegación — COO', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/coo/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('UAT-NAVCO-01 | el COO ve los links: Inicio, Por Medicamento, Inventario, Médicos', async ({ page }) => {
    await expect(page.locator('nav a', { hasText: 'Inicio' }).first()).toBeVisible();
    await expect(page.locator('nav a', { hasText: 'Por Medicamento' }).first()).toBeVisible();
    await expect(page.locator('nav a', { hasText: 'Inventario' }).first()).toBeVisible();
    await expect(page.locator('nav a', { hasText: 'Médicos' }).first()).toBeVisible();
  });

  test('UAT-NAVCO-02 | clic en "Inventario" navega a /coo/inventory', async ({ page }) => {
    await page.click('nav a[href="/coo/inventory"]');
    await expect(page).toHaveURL('/coo/inventory');
  });

  test('UAT-NAVCO-03 | logo del COO navega al dashboard del COO', async ({ page }) => {
    await page.goto('/coo/inventory');
    await page.click('header a[aria-label*="MedSync"]');
    await expect(page).toHaveURL('/coo/dashboard');
  });

  test('UAT-NAVCO-04 | "Cerrar sesión" del COO redirige a la pantalla de login', async ({ page }) => {
    await page.click('button[aria-haspopup="menu"]');
    await page.click('[role="menuitem"]:has-text("Cerrar sesión")');
    await expect(page).toHaveURL('/', { timeout: 5_000 });
  });

});
