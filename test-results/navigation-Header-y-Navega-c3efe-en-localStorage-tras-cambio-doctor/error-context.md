# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Header y Navegación — Doctor >> UAT-NAV-20 | el tema persiste en localStorage tras cambio
- Location: e2e\navigation.spec.ts:166:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button[aria-label*="Activar"]')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - link "MedSync — Inicio" [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
        - generic [ref=e10]: MedSync
      - button "Cambiar a modo oscuro" [ref=e11]:
        - img [ref=e12]
    - generic [ref=e15]:
      - generic [ref=e16]: Plataforma para profesionales de la salud
      - heading "Bienvenido de vuelta" [level=1] [ref=e18]
      - paragraph [ref=e19]: Accede a tu panel clínico para consultar historiales, gestionar pacientes y dar continuidad a tus consultas.
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Correo electrónico
          - generic [ref=e23]:
            - img
            - textbox "Correo electrónico" [ref=e24]:
              - /placeholder: nombre@clinica.com
        - generic [ref=e25]:
          - generic [ref=e26]: Contraseña
          - generic [ref=e27]:
            - img
            - textbox "Contraseña" [ref=e28]:
              - /placeholder: ••••••••
            - button "Mostrar contraseña" [ref=e29]:
              - img [ref=e30]
        - generic [ref=e34] [cursor=pointer]:
          - checkbox "Mantener sesión iniciada" [checked] [ref=e35]
          - img [ref=e37]
          - text: Mantener sesión iniciada
        - button "Iniciar sesión" [ref=e39]:
          - generic [ref=e40]: Iniciar sesión
          - img [ref=e41]
    - generic [ref=e43]:
      - generic [ref=e44]: © 2026 MedSync. Todos los derechos reservados.
      - generic [ref=e45]:
        - link "Privacidad" [ref=e46] [cursor=pointer]:
          - /url: /privacidad
        - link "Términos" [ref=e47] [cursor=pointer]:
          - /url: /terminos
  - complementary [ref=e48]:
    - generic [ref=e53]:
      - generic [ref=e54]:
        - generic [ref=e55]: LITERATURA RELEVANTE
        - heading "Evidencia de PubMed, cruzada con el caso de tu paciente." [level=2] [ref=e56]:
          - text: Evidencia de
          - emphasis [ref=e57]: PubMed
          - text: ", cruzada con el caso de tu paciente."
        - paragraph [ref=e58]: Sincronizamos artículos científicos desde NCBI y los emparejamos con el contexto clínico para sugerirte lecturas relevantes en segundos.
        - generic [ref=e59]:
          - generic [ref=e60]:
            - img [ref=e62]
            - text: Sincronización con PubMed
          - generic [ref=e64]:
            - img [ref=e66]
            - text: Análisis IA por artículo
          - generic [ref=e69]:
            - img [ref=e71]
            - text: Sugerencias en segundos
      - generic [ref=e74]:
        - tablist [ref=e75]:
          - tab "Ir a la diapositiva 1" [ref=e76]
          - tab "Ir a la diapositiva 2" [selected] [ref=e77]
          - tab "Ir a la diapositiva 3" [ref=e78]
        - generic [ref=e79]:
          - button "Anterior" [ref=e80]:
            - img [ref=e81]
          - button "Siguiente" [ref=e83]:
            - img [ref=e84]
```

# Test source

```ts
  68  |     const inicioLink = page.locator('nav a[aria-current="page"]');
  69  |     await expect(inicioLink).toBeVisible();
  70  |     // El span indicador (línea bajo el link activo)
  71  |     await expect(inicioLink.locator('span[aria-hidden="true"]')).toBeVisible();
  72  |   });
  73  | 
  74  |   // ── Menú de usuario ───────────────────────────────────────────────────────
  75  | 
  76  |   test('UAT-NAV-08 | el nombre del usuario aparece en el header', async ({ page }) => {
  77  |     // El botón de avatar muestra el nombre
  78  |     const userBtn = page.locator('button[aria-haspopup="menu"]');
  79  |     await expect(userBtn).toBeVisible();
  80  |     await expect(userBtn.locator('span.font-semibold')).toBeVisible();
  81  |   });
  82  | 
  83  |   test('UAT-NAV-09 | clic en el avatar abre el menú de usuario', async ({ page }) => {
  84  |     await page.click('button[aria-haspopup="menu"]');
  85  |     await expect(page.locator('[role="menu"]')).toBeVisible({ timeout: 3_000 });
  86  |   });
  87  | 
  88  |   test('UAT-NAV-10 | menú de usuario muestra el nombre y email del usuario', async ({ page }) => {
  89  |     await page.click('button[aria-haspopup="menu"]');
  90  |     const menu = page.locator('[role="menu"]');
  91  |     await expect(menu).toBeVisible();
  92  |     // El menú tiene una sección con nombre y email
  93  |     await expect(menu.locator('p.text-sm.font-semibold')).toBeVisible();
  94  |     await expect(menu.locator('p.text-xs')).toBeVisible();
  95  |   });
  96  | 
  97  |   test('UAT-NAV-11 | menú de usuario tiene la opción "Perfil"', async ({ page }) => {
  98  |     await page.click('button[aria-haspopup="menu"]');
  99  |     await expect(page.locator('[role="menuitem"]', { hasText: 'Perfil' })).toBeVisible();
  100 |   });
  101 | 
  102 |   test('UAT-NAV-12 | clic en "Perfil" navega a la página de perfil', async ({ page }) => {
  103 |     await page.click('button[aria-haspopup="menu"]');
  104 |     await page.click('[role="menuitem"]:has-text("Perfil")');
  105 |     await expect(page).toHaveURL(/\/doctor\/profile/);
  106 |   });
  107 | 
  108 |   test('UAT-NAV-13 | menú de usuario tiene el botón "Cerrar sesión"', async ({ page }) => {
  109 |     await page.click('button[aria-haspopup="menu"]');
  110 |     await expect(page.locator('[role="menuitem"]', { hasText: 'Cerrar sesión' })).toBeVisible();
  111 |   });
  112 | 
  113 |   test('UAT-NAV-14 | "Cerrar sesión" desloguea al usuario y redirige a /', async ({ page }) => {
  114 |     await page.click('button[aria-haspopup="menu"]');
  115 |     await page.click('[role="menuitem"]:has-text("Cerrar sesión")');
  116 |     await expect(page).toHaveURL('/', { timeout: 5_000 });
  117 |     // La página de login debe estar visible
  118 |     await expect(page.locator('#email')).toBeVisible({ timeout: 5_000 });
  119 |   });
  120 | 
  121 |   test('UAT-NAV-15 | menú de usuario se cierra al hacer clic fuera de él', async ({ page }) => {
  122 |     await page.click('button[aria-haspopup="menu"]');
  123 |     await expect(page.locator('[role="menu"]')).toBeVisible();
  124 |     // Hacer clic en algún lugar fuera del menú
  125 |     await page.click('h1, main', { force: true });
  126 |     await expect(page.locator('[role="menu"]')).not.toBeVisible({ timeout: 3_000 });
  127 |   });
  128 | 
  129 |   test('UAT-NAV-16 | Escape cierra el menú de usuario', async ({ page }) => {
  130 |     await page.click('button[aria-haspopup="menu"]');
  131 |     await expect(page.locator('[role="menu"]')).toBeVisible();
  132 |     await page.keyboard.press('Escape');
  133 |     await expect(page.locator('[role="menu"]')).not.toBeVisible({ timeout: 3_000 });
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
> 168 |     await page.click('button[aria-label*="Activar"]');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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
  234 |     await expect(page.locator('nav a', { hasText: 'Inicio' }).first()).toBeVisible();
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