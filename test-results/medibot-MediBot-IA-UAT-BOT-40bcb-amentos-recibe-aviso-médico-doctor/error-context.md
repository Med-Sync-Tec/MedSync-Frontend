# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: medibot.spec.ts >> MediBot IA >> UAT-BOT-17 | pregunta sobre medicamentos recibe aviso médico
- Location: e2e\medibot.spec.ts:180:3

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
  1   | /**
  2   |  * UAT — MediBot IA (chat widget en DoctorLayout y CooLayout)
  3   |  *
  4   |  * Cubre:
  5   |  *   - FAB "MediBot IA" está visible en el dashboard
  6   |  *   - FAB abre el panel del chat al hacer clic
  7   |  *   - FAB muestra "Cerrar MediBot" cuando el chat está abierto
  8   |  *   - Chat muestra mensaje de bienvenida inicial
  9   |  *   - El campo de entrada tiene el placeholder correcto
  10  |  *   - Enviar mensaje con el botón
  11  |  *   - Enviar mensaje con la tecla Enter
  12  |  *   - El input se deshabilita mientras espera respuesta del bot
  13  |  *   - Indicador de "escribiendo" (···) aparece durante la carga
  14  |  *   - El mensaje enviado aparece alineado a la derecha
  15  |  *   - La respuesta del bot aparece alineada a la izquierda
  16  |  *   - Pregunta de guía de navegación (¿cómo agrego un paciente?)
  17  |  *   - Pregunta general de información del sistema (¿qué es MedSync?)
  18  |  *   - Pregunta con términos clínicos recibe advertencia/aviso médico
  19  |  *   - Mensaje CRÍTICO (emergencia/suicidio) recibe respuesta especial cerrada
  20  |  *   - Respuesta del bot renderiza markdown (negritas, listas)
  21  |  *   - Botón "X" del header del chat cierra el panel (onClose)
  22  |  *   - Chat persiste mensajes al cerrar y volver a abrir
  23  |  *   - Múltiples mensajes en conversación (contexto conservado)
  24  |  */
  25  | import { test, expect } from '@playwright/test';
  26  | 
  27  | const MEDIBOT_FAB = '[aria-label="Abrir MediBot"]';
  28  | const MEDIBOT_CLOSE_FAB = '[aria-label="Cerrar MediBot"]';
  29  | const CHAT_CLOSE_BTN = '[aria-label="Cerrar chat"]';
  30  | const CHAT_INPUT = 'input[placeholder*="MediBot"], textarea[placeholder*="MediBot"], input[placeholder*="pregunta"]';
  31  | const SEND_BTN = 'button[type="submit"][aria-label*="nv"], button[aria-label*="Enviar"], button:has(span:text("send"))';
  32  | const LOADING_INDICATOR = '[role="status"][aria-label*="escribiendo"], [role="status"][aria-label*="MediBot está"]';
  33  | const CHAT_HEADER = 'text=MediBot IA';
  34  | 
  35  | async function openMedibot(page: import('@playwright/test').Page) {
  36  |   const fab = page.locator(MEDIBOT_FAB);
> 37  |   await expect(fab).toBeVisible({ timeout: 10_000 });
      |                     ^ Error: expect(locator).toBeVisible() failed
  38  |   await fab.click();
  39  |   await expect(page.locator(CHAT_HEADER)).toBeVisible({ timeout: 5_000 });
  40  | }
  41  | 
  42  | async function sendMessage(page: import('@playwright/test').Page, message: string) {
  43  |   const input = page.locator(CHAT_INPUT).first();
  44  |   await input.fill(message);
  45  |   await page.keyboard.press('Enter');
  46  | }
  47  | 
  48  | test.describe('MediBot IA', () => {
  49  | 
  50  |   test.beforeEach(async ({ page }) => {
  51  |     await page.goto('/doctor/dashboard');
  52  |     await page.waitForLoadState('networkidle');
  53  |   });
  54  | 
  55  |   // ── FAB ──────────────────────────────────────────────────────────────────
  56  | 
  57  |   test('UAT-BOT-01 | el FAB "MediBot IA" está visible en el dashboard', async ({ page }) => {
  58  |     await expect(page.locator(MEDIBOT_FAB)).toBeVisible({ timeout: 10_000 });
  59  |   });
  60  | 
  61  |   test('UAT-BOT-02 | el FAB muestra la etiqueta "MediBot IA"', async ({ page }) => {
  62  |     await expect(page.locator('text=MediBot IA')).toBeVisible({ timeout: 10_000 });
  63  |   });
  64  | 
  65  |   test('UAT-BOT-03 | clic en el FAB abre el panel del chat', async ({ page }) => {
  66  |     await openMedibot(page);
  67  |     await expect(page.locator(CHAT_HEADER)).toBeVisible();
  68  |   });
  69  | 
  70  |   test('UAT-BOT-04 | FAB cambia a "Cerrar MediBot" cuando el chat está abierto', async ({ page }) => {
  71  |     await openMedibot(page);
  72  |     await expect(page.locator(MEDIBOT_CLOSE_FAB)).toBeVisible();
  73  |     await expect(page.locator(MEDIBOT_FAB)).not.toBeVisible();
  74  |   });
  75  | 
  76  |   test('UAT-BOT-05 | clic en el FAB "Cerrar MediBot" cierra el panel', async ({ page }) => {
  77  |     await openMedibot(page);
  78  |     await page.locator(MEDIBOT_CLOSE_FAB).click();
  79  |     await expect(page.locator(CHAT_HEADER)).not.toBeVisible({ timeout: 3_000 });
  80  |   });
  81  | 
  82  |   // ── Mensaje de bienvenida ────────────────────────────────────────────────
  83  | 
  84  |   test('UAT-BOT-06 | chat muestra mensaje de bienvenida cuando no hay historial', async ({ page }) => {
  85  |     await openMedibot(page);
  86  |     await expect(
  87  |       page.locator('text=/Hola, soy MediBot|¿En qué puedo ayudarte?/')
  88  |     ).toBeVisible({ timeout: 5_000 });
  89  |   });
  90  | 
  91  |   // ── Input y envío ─────────────────────────────────────────────────────────
  92  | 
  93  |   test('UAT-BOT-07 | campo de entrada tiene placeholder correcto', async ({ page }) => {
  94  |     await openMedibot(page);
  95  |     await expect(
  96  |       page.locator('input[placeholder*="pregunta"], input[placeholder*="MediBot"]')
  97  |     ).toBeVisible();
  98  |   });
  99  | 
  100 |   test('UAT-BOT-08 | se puede escribir en el campo de entrada', async ({ page }) => {
  101 |     await openMedibot(page);
  102 |     const input = page.locator(CHAT_INPUT).first();
  103 |     await input.fill('Hola, ¿cómo estás?');
  104 |     await expect(input).toHaveValue('Hola, ¿cómo estás?');
  105 |   });
  106 | 
  107 |   test('UAT-BOT-09 | el campo se vacía tras enviar el mensaje', async ({ page }) => {
  108 |     await openMedibot(page);
  109 |     const input = page.locator(CHAT_INPUT).first();
  110 |     await input.fill('Mensaje de prueba');
  111 |     await page.keyboard.press('Enter');
  112 |     await expect(input).toHaveValue('', { timeout: 3_000 });
  113 |   });
  114 | 
  115 |   test('UAT-BOT-10 | el mensaje enviado aparece en el chat (burbuja derecha)', async ({ page }) => {
  116 |     await openMedibot(page);
  117 |     await sendMessage(page, '¿Qué es MedSync?');
  118 |     await expect(
  119 |       page.locator('text=¿Qué es MedSync?')
  120 |     ).toBeVisible({ timeout: 5_000 });
  121 |   });
  122 | 
  123 |   // ── Estado de carga ──────────────────────────────────────────────────────
  124 | 
  125 |   test('UAT-BOT-11 | indicador "···" aparece mientras el bot responde', async ({ page }) => {
  126 |     await openMedibot(page);
  127 |     await sendMessage(page, '¿Qué hace MedSync?');
  128 |     await expect(page.locator(LOADING_INDICATOR)).toBeVisible({ timeout: 8_000 });
  129 |   });
  130 | 
  131 |   test('UAT-BOT-12 | el input se deshabilita mientras el bot está respondiendo', async ({ page }) => {
  132 |     await openMedibot(page);
  133 |     await sendMessage(page, '¿Cuáles son las funciones principales?');
  134 |     const input = page.locator(CHAT_INPUT).first();
  135 |     await expect(input).toBeDisabled({ timeout: 8_000 });
  136 |   });
  137 | 
```