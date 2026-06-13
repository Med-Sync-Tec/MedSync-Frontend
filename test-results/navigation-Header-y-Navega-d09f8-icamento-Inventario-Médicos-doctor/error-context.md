# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Header y Navegación — COO >> UAT-NAVCO-01 | el COO ve los links: Inicio, Por Medicamento, Inventario, Médicos
- Location: e2e\navigation.spec.ts:233:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('nav a').filter({ hasText: 'Inicio' }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('nav a').filter({ hasText: 'Inicio' }).first()

```

```yaml
- link "MedSync — Inicio":
  - /url: /
  - text: MedSync
- button "Cambiar a modo oscuro"
- text: Plataforma para profesionales de la salud
- heading "Bienvenido de vuelta" [level=1]
- paragraph: Accede a tu panel clínico para consultar historiales, gestionar pacientes y dar continuidad a tus consultas.
- text: Correo electrónico
- textbox "Correo electrónico":
  - /placeholder: nombre@clinica.com
- text: Contraseña
- textbox "Contraseña":
  - /placeholder: ••••••••
- button "Mostrar contraseña"
- checkbox "Mantener sesión iniciada" [checked]
- text: Mantener sesión iniciada
- button "Iniciar sesión"
- text: © 2026 MedSync. Todos los derechos reservados.
- link "Privacidad":
  - /url: /privacidad
- link "Términos":
  - /url: /terminos
- complementary:
  - text: EXPEDIENTE CONECTADO
  - heading "El expediente del hospital, a un clic de tu consulta." [level=2]:
    - text: El expediente del
    - emphasis: hospital
    - text: ", a un clic de tu consulta."
  - paragraph: MedSync se conecta a la base de datos clínica del hospital para que tengas el contexto del paciente sin duplicar información sensible.
  - text: Datos en BD del hospital Notas SOAP integradas
  - tablist:
    - tab "Ir a la diapositiva 1" [selected]
    - tab "Ir a la diapositiva 2"
    - tab "Ir a la diapositiva 3"
  - button "Anterior"
  - button "Siguiente"
```

# Test source

```ts
  134 |   });
  135 | 
  136 |   // ── Toggle de tema ────────────────────────────────────────────────────────
  137 | 
  138 |   test('UAT-NAV-17 | botón de toggle de tema está visible en pantallas medianas y grandes', async ({ page }) => {
  139 |     // Viewport desktop
  140 |     await page.setViewportSize({ width: 1280, height: 800 });
  141 |     await expect(
  142 |       page.locator('button[aria-label*="modo"], button[aria-label*="Activar"]')
  143 |     ).toBeVisible();
  144 |   });
  145 | 
  146 |   test('UAT-NAV-18 | toggle de tema cambia entre claro y oscuro', async ({ page }) => {
  147 |     await page.setViewportSize({ width: 1280, height: 800 });
  148 |     const themeBtn = page.locator('button[aria-label*="modo"], button[aria-label*="Activar"]').first();
  149 |     const initialLabel = await themeBtn.getAttribute('aria-label');
  150 |     await themeBtn.click();
  151 |     const newLabel = await themeBtn.getAttribute('aria-label');
  152 |     expect(newLabel).not.toBe(initialLabel);
  153 |   });
  154 | 
  155 |   test('UAT-NAV-19 | el tema oscuro aplica la clase "dark" en el elemento html', async ({ page }) => {
  156 |     await page.setViewportSize({ width: 1280, height: 800 });
  157 |     // Activar modo oscuro si no está activo
  158 |     const html = page.locator('html');
  159 |     const isDark = (await html.getAttribute('class'))?.includes('dark') ?? false;
  160 |     if (!isDark) {
  161 |       await page.click('button[aria-label*="Activar modo oscuro"]');
  162 |     }
  163 |     await expect(html).toHaveClass(/dark/, { timeout: 3_000 });
  164 |   });
  165 | 
  166 |   test('UAT-NAV-20 | el tema persiste en localStorage tras cambio', async ({ page }) => {
  167 |     await page.setViewportSize({ width: 1280, height: 800 });
  168 |     await page.click('button[aria-label*="Activar"]');
  169 |     await page.waitForTimeout(300);
  170 |     const stored = await page.evaluate(() => localStorage.getItem('medsync-theme'));
  171 |     expect(stored).toBeTruthy();
  172 |   });
  173 | 
  174 |   // ── Menú móvil ────────────────────────────────────────────────────────────
  175 | 
  176 |   test('UAT-NAV-21 | botón hamburguesa está visible en viewport móvil', async ({ page }) => {
  177 |     await page.setViewportSize({ width: 375, height: 812 });
  178 |     await page.goto('/doctor/dashboard');
  179 |     await expect(page.locator('button[aria-label="Abrir menú"]')).toBeVisible();
  180 |   });
  181 | 
  182 |   test('UAT-NAV-22 | clic en hamburguesa abre el menú de navegación móvil', async ({ page }) => {
  183 |     await page.setViewportSize({ width: 375, height: 812 });
  184 |     await page.goto('/doctor/dashboard');
  185 |     await page.click('button[aria-label="Abrir menú"]');
  186 |     await expect(page.locator('nav[aria-label="Navegación móvil"]')).toBeVisible({ timeout: 3_000 });
  187 |   });
  188 | 
  189 |   test('UAT-NAV-23 | clic en X cierra el menú de navegación móvil', async ({ page }) => {
  190 |     await page.setViewportSize({ width: 375, height: 812 });
  191 |     await page.goto('/doctor/dashboard');
  192 |     await page.click('button[aria-label="Abrir menú"]');
  193 |     await expect(page.locator('nav[aria-label="Navegación móvil"]')).toBeVisible();
  194 |     await page.click('button[aria-label="Cerrar menú"]');
  195 |     await expect(page.locator('nav[aria-label="Navegación móvil"]')).not.toBeVisible({ timeout: 3_000 });
  196 |   });
  197 | 
  198 |   test('UAT-NAV-24 | navegar desde el menú móvil cierra el menú', async ({ page }) => {
  199 |     await page.setViewportSize({ width: 375, height: 812 });
  200 |     await page.goto('/doctor/dashboard');
  201 |     await page.click('button[aria-label="Abrir menú"]');
  202 |     await expect(page.locator('nav[aria-label="Navegación móvil"]')).toBeVisible();
  203 |     await page.click('nav[aria-label="Navegación móvil"] a', { hasText: 'Pacientes' });
  204 |     await expect(page.locator('nav[aria-label="Navegación móvil"]')).not.toBeVisible({ timeout: 3_000 });
  205 |   });
  206 | 
  207 |   // ── Búsqueda global ──────────────────────────────────────────────────────
  208 | 
  209 |   test('UAT-NAV-25 | Ctrl+K enfoca el campo de búsqueda global', async ({ page }) => {
  210 |     await page.keyboard.press('Control+k');
  211 |     const searchInput = page.locator('input[placeholder*="Buscar"], input[placeholder*="buscar"]').first();
  212 |     await expect(searchInput).toBeFocused({ timeout: 3_000 });
  213 |   });
  214 | 
  215 |   // ── Sticky header ─────────────────────────────────────────────────────────
  216 | 
  217 |   test('UAT-NAV-26 | el header permanece visible al hacer scroll hacia abajo', async ({ page }) => {
  218 |     await page.evaluate(() => window.scrollTo(0, 1000));
  219 |     await expect(page.locator('header').first()).toBeVisible();
  220 |   });
  221 | 
  222 | });
  223 | 
  224 | // ── COO navigation ────────────────────────────────────────────────────────
  225 | 
  226 | test.describe('Header y Navegación — COO', () => {
  227 | 
  228 |   test.beforeEach(async ({ page }) => {
  229 |     await page.goto('/coo/dashboard');
  230 |     await page.waitForLoadState('networkidle');
  231 |   });
  232 | 
  233 |   test('UAT-NAVCO-01 | el COO ve los links: Inicio, Por Medicamento, Inventario, Médicos', async ({ page }) => {
> 234 |     await expect(page.locator('nav a', { hasText: 'Inicio' }).first()).toBeVisible();
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  235 |     await expect(page.locator('nav a', { hasText: 'Por Medicamento' }).first()).toBeVisible();
  236 |     await expect(page.locator('nav a', { hasText: 'Inventario' }).first()).toBeVisible();
  237 |     await expect(page.locator('nav a', { hasText: 'Médicos' }).first()).toBeVisible();
  238 |   });
  239 | 
  240 |   test('UAT-NAVCO-02 | clic en "Inventario" navega a /coo/inventory', async ({ page }) => {
  241 |     await page.click('nav a[href="/coo/inventory"]');
  242 |     await expect(page).toHaveURL('/coo/inventory');
  243 |   });
  244 | 
  245 |   test('UAT-NAVCO-03 | logo del COO navega al dashboard del COO', async ({ page }) => {
  246 |     await page.goto('/coo/inventory');
  247 |     await page.click('header a[aria-label*="MedSync"]');
  248 |     await expect(page).toHaveURL('/coo/dashboard');
  249 |   });
  250 | 
  251 |   test('UAT-NAVCO-04 | "Cerrar sesión" del COO redirige a la pantalla de login', async ({ page }) => {
  252 |     await page.click('button[aria-haspopup="menu"]');
  253 |     await page.click('[role="menuitem"]:has-text("Cerrar sesión")');
  254 |     await expect(page).toHaveURL('/', { timeout: 5_000 });
  255 |   });
  256 | 
  257 | });
  258 | 
```