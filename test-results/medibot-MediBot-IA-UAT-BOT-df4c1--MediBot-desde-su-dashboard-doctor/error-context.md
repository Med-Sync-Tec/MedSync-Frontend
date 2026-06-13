# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: medibot.spec.ts >> MediBot IA >> UAT-BOT-26 | el COO también puede abrir MediBot desde su dashboard
- Location: e2e\medibot.spec.ts:304:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[aria-label="Abrir MediBot"]')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[aria-label="Abrir MediBot"]')

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
  - text: LITERATURA RELEVANTE
  - heading "Evidencia de PubMed, cruzada con el caso de tu paciente." [level=2]:
    - text: Evidencia de
    - emphasis: PubMed
    - text: ", cruzada con el caso de tu paciente."
  - paragraph: Sincronizamos artículos científicos desde NCBI y los emparejamos con el contexto clínico para sugerirte lecturas relevantes en segundos.
  - text: Sincronización con PubMed Análisis IA por artículo Sugerencias en segundos
  - tablist:
    - tab "Ir a la diapositiva 1"
    - tab "Ir a la diapositiva 2" [selected]
    - tab "Ir a la diapositiva 3"
  - button "Anterior"
  - button "Siguiente"
```

# Test source

```ts
  207 |     await expect(botMsg).toBeVisible();
  208 |     await expect(botMsg).not.toBeEmpty();
  209 |   });
  210 | 
  211 |   // ── Markdown rendering ───────────────────────────────────────────────────
  212 | 
  213 |   test('UAT-BOT-20 | el bot renderiza **texto en negrita** correctamente', async ({ page }) => {
  214 |     // Mockear respuesta del backend con markdown
  215 |     await page.route('**/api/chat', (route) => {
  216 |       route.fulfill({
  217 |         status: 200,
  218 |         contentType: 'application/json',
  219 |         body: JSON.stringify({
  220 |           response: '**MedSync** es una herramienta para el área de salud.',
  221 |           isCritical: false,
  222 |         }),
  223 |       });
  224 |     });
  225 |     await openMedibot(page);
  226 |     await sendMessage(page, '¿Qué es MedSync?');
  227 |     await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 15_000 });
  228 |     // El texto debe renderizarse como <strong>
  229 |     await expect(page.locator('strong', { hasText: 'MedSync' })).toBeVisible({ timeout: 5_000 });
  230 |   });
  231 | 
  232 |   test('UAT-BOT-21 | el bot renderiza listas con guiones (- item) como <ul><li>', async ({ page }) => {
  233 |     await page.route('**/api/chat', (route) => {
  234 |       route.fulfill({
  235 |         status: 200,
  236 |         contentType: 'application/json',
  237 |         body: JSON.stringify({
  238 |           response: '- Gestión de pacientes\n- Historial de consultas\n- Inventario',
  239 |           isCritical: false,
  240 |         }),
  241 |       });
  242 |     });
  243 |     await openMedibot(page);
  244 |     await sendMessage(page, '¿Qué módulos tiene?');
  245 |     await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 15_000 });
  246 |     await expect(page.locator('ul li', { hasText: 'Gestión de pacientes' })).toBeVisible({ timeout: 5_000 });
  247 |   });
  248 | 
  249 |   test('UAT-BOT-22 | el bot renderiza encabezados ### como texto semibold', async ({ page }) => {
  250 |     await page.route('**/api/chat', (route) => {
  251 |       route.fulfill({
  252 |         status: 200,
  253 |         contentType: 'application/json',
  254 |         body: JSON.stringify({
  255 |           response: '### Módulos principales\nMedSync tiene varios módulos.',
  256 |           isCritical: false,
  257 |         }),
  258 |       });
  259 |     });
  260 |     await openMedibot(page);
  261 |     await sendMessage(page, '¿Cuáles son los módulos?');
  262 |     await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 15_000 });
  263 |     await expect(
  264 |       page.locator('p.font-semibold, p[class*="font-semibold"]', { hasText: 'Módulos principales' })
  265 |     ).toBeVisible({ timeout: 5_000 });
  266 |   });
  267 | 
  268 |   // ── Botón cerrar chat (X del header) ────────────────────────────────────
  269 | 
  270 |   test('UAT-BOT-23 | botón X del header del chat cierra el panel', async ({ page }) => {
  271 |     await openMedibot(page);
  272 |     await page.locator(CHAT_CLOSE_BTN).click();
  273 |     await expect(page.locator(CHAT_HEADER)).not.toBeVisible({ timeout: 3_000 });
  274 |   });
  275 | 
  276 |   // ── Persistencia de mensajes ─────────────────────────────────────────────
  277 | 
  278 |   test('UAT-BOT-24 | los mensajes persisten al cerrar y volver a abrir el chat', async ({ page }) => {
  279 |     await openMedibot(page);
  280 |     await sendMessage(page, 'Mensaje que debe persistir');
  281 |     await expect(page.locator('text=Mensaje que debe persistir')).toBeVisible({ timeout: 8_000 });
  282 |     // Cerrar y reabrir
  283 |     await page.locator(MEDIBOT_CLOSE_FAB).click();
  284 |     await page.locator(MEDIBOT_FAB).click();
  285 |     // El mensaje debe seguir ahí
  286 |     await expect(page.locator('text=Mensaje que debe persistir')).toBeVisible({ timeout: 5_000 });
  287 |   });
  288 | 
  289 |   // ── Conversación multi-turno ─────────────────────────────────────────────
  290 | 
  291 |   test('UAT-BOT-25 | se pueden enviar múltiples mensajes en la misma conversación', async ({ page }) => {
  292 |     await openMedibot(page);
  293 |     await sendMessage(page, '¿Qué es MedSync?');
  294 |     await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
  295 |     await sendMessage(page, '¿Cuántos módulos tiene?');
  296 |     await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
  297 |     // Debe haber al menos 4 mensajes (2 usuario + 2 bot)
  298 |     const userMsgs = page.locator('.justify-end');
  299 |     await expect(userMsgs).toHaveCount(2, { timeout: 5_000 });
  300 |   });
  301 | 
  302 |   // ── MediBot en COO layout ────────────────────────────────────────────────
  303 | 
  304 |   test('UAT-BOT-26 | el COO también puede abrir MediBot desde su dashboard', async ({ page }) => {
  305 |     await page.goto('/coo/dashboard');
  306 |     await page.waitForLoadState('networkidle');
> 307 |     await expect(page.locator(MEDIBOT_FAB)).toBeVisible({ timeout: 10_000 });
      |                                             ^ Error: expect(locator).toBeVisible() failed
  308 |     await page.locator(MEDIBOT_FAB).click();
  309 |     await expect(page.locator(CHAT_HEADER)).toBeVisible({ timeout: 5_000 });
  310 |   });
  311 | 
  312 | });
  313 | 
```