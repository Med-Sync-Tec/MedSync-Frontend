# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: consultation-history.spec.ts >> Historial de Consultas >> UAT-HIST-02 | clic en "Pacientes" del breadcrumb regresa a la lista
- Location: e2e\consultation-history.spec.ts:42:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a').filter({ hasText: 'Pacientes' }).first()

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
  1   | /**
  2   |  * UAT — Historial de Consultas (/patients/:id/history)
  3   |  *
  4   |  * Cubre:
  5   |  *   - Breadcrumb de navegación (Pacientes > Nombre > Historial)
  6   |  *   - Tarjeta de información del paciente
  7   |  *   - Línea de tiempo de consultas agrupadas por año
  8   |  *   - Estado vacío ("Sin historial")
  9   |  *   - Estado de carga
  10  |  *   - Clic en consulta abre el modal SOAP
  11  |  *   - Modal SOAP muestra secciones S / O / A / P
  12  |  *   - Modal SOAP se puede cerrar
  13  |  *   - Botón "Nueva consulta" navega al formulario
  14  |  *   - Panel de contextos del paciente (tags/especialidades)
  15  |  *   - Panel de artículos relacionados
  16  |  *   - Botón "Filtrar" es visible
  17  |  *   - Botón volver navega a la lista de pacientes
  18  |  */
  19  | import { test, expect } from '@playwright/test';
  20  | 
  21  | const PATIENT_ID_PLACEHOLDER = 'test-patient-id';
  22  | 
  23  | test.describe('Historial de Consultas', () => {
  24  | 
  25  |   test.beforeEach(async ({ page }) => {
  26  |     // Navegar desde la lista de pacientes al primer paciente real
  27  |     await page.goto('/doctor/patients');
  28  |     await page.waitForLoadState('networkidle');
  29  |     const firstCard = page.locator('li').first();
  30  |     if (await firstCard.isVisible({ timeout: 8_000 })) {
  31  |       await firstCard.click();
  32  |       await page.waitForURL(/\/patients\/.+\/history/, { timeout: 8_000 });
  33  |     }
  34  |   });
  35  | 
  36  |   // ── Breadcrumb ───────────────────────────────────────────────────────────
  37  | 
  38  |   test('UAT-HIST-01 | muestra breadcrumb con "Pacientes" como primer nivel', async ({ page }) => {
  39  |     await expect(page.locator('text=Pacientes')).toBeVisible();
  40  |   });
  41  | 
  42  |   test('UAT-HIST-02 | clic en "Pacientes" del breadcrumb regresa a la lista', async ({ page }) => {
> 43  |     await page.locator('a', { hasText: 'Pacientes' }).first().click();
      |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  44  |     await expect(page).toHaveURL('/doctor/patients');
  45  |   });
  46  | 
  47  |   // ── Información del paciente ─────────────────────────────────────────────
  48  | 
  49  |   test('UAT-HIST-03 | muestra la tarjeta de información del paciente', async ({ page }) => {
  50  |     // Algún dato del paciente debe estar visible (expediente o nombre)
  51  |     await expect(
  52  |       page.locator('text=/EXP|expediente/i').or(page.locator('text=Historial'))
  53  |     ).toBeVisible({ timeout: 10_000 });
  54  |   });
  55  | 
  56  |   // ── Línea de tiempo ──────────────────────────────────────────────────────
  57  | 
  58  |   test('UAT-HIST-04 | las consultas se muestran agrupadas (al menos un grupo de año)', async ({ page }) => {
  59  |     await page.waitForLoadState('networkidle');
  60  |     const hasConsultations = await page.locator('text=/\\d{4}|Historial/').count() > 0;
  61  |     expect(hasConsultations).toBeTruthy();
  62  |   });
  63  | 
  64  |   test('UAT-HIST-05 | estado vacío muestra mensaje "Sin historial" si no hay consultas', async ({ page }) => {
  65  |     // Mockear vacío
  66  |     await page.route('**/api/patients/**/consultations**', (route) => {
  67  |       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  68  |     });
  69  |     // Recargar la misma página de historial
  70  |     await page.reload();
  71  |     await expect(page.locator('text=Sin historial')).toBeVisible({ timeout: 8_000 });
  72  |   });
  73  | 
  74  |   // ── Modal SOAP ───────────────────────────────────────────────────────────
  75  | 
  76  |   test('UAT-HIST-06 | clic en una consulta abre el modal SOAP', async ({ page }) => {
  77  |     await page.waitForLoadState('networkidle');
  78  |     const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
  79  |     if (await consulta.isVisible({ timeout: 5_000 })) {
  80  |       await consulta.click();
  81  |       await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });
  82  |     }
  83  |   });
  84  | 
  85  |   test('UAT-HIST-07 | modal SOAP muestra la sección Subjetivo (S)', async ({ page }) => {
  86  |     await page.waitForLoadState('networkidle');
  87  |     const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
  88  |     if (await consulta.isVisible({ timeout: 5_000 })) {
  89  |       await consulta.click();
  90  |       await expect(
  91  |         page.locator('text=/Subjetiv|Subjective|\\bS\\b/i')
  92  |       ).toBeVisible({ timeout: 5_000 });
  93  |     }
  94  |   });
  95  | 
  96  |   test('UAT-HIST-08 | modal SOAP muestra la sección Objetivo (O)', async ({ page }) => {
  97  |     await page.waitForLoadState('networkidle');
  98  |     const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
  99  |     if (await consulta.isVisible({ timeout: 5_000 })) {
  100 |       await consulta.click();
  101 |       await expect(
  102 |         page.locator('text=/Objetiv|Objective|\\bO\\b/i')
  103 |       ).toBeVisible({ timeout: 5_000 });
  104 |     }
  105 |   });
  106 | 
  107 |   test('UAT-HIST-09 | modal SOAP muestra la sección Evaluación/Análisis (A)', async ({ page }) => {
  108 |     await page.waitForLoadState('networkidle');
  109 |     const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
  110 |     if (await consulta.isVisible({ timeout: 5_000 })) {
  111 |       await consulta.click();
  112 |       await expect(
  113 |         page.locator('text=/[Ee]valuaci|[Aa]nálisis|[Aa]ssessment|\\bA\\b/')
  114 |       ).toBeVisible({ timeout: 5_000 });
  115 |     }
  116 |   });
  117 | 
  118 |   test('UAT-HIST-10 | modal SOAP muestra la sección Plan (P)', async ({ page }) => {
  119 |     await page.waitForLoadState('networkidle');
  120 |     const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
  121 |     if (await consulta.isVisible({ timeout: 5_000 })) {
  122 |       await consulta.click();
  123 |       await expect(
  124 |         page.locator('text=/\\bPlan\\b|\\bP\\b/')
  125 |       ).toBeVisible({ timeout: 5_000 });
  126 |     }
  127 |   });
  128 | 
  129 |   test('UAT-HIST-11 | modal SOAP se puede cerrar con el botón X', async ({ page }) => {
  130 |     await page.waitForLoadState('networkidle');
  131 |     const consulta = page.locator('[data-testid="consultation-item"], article, li[role="button"]').first();
  132 |     if (await consulta.isVisible({ timeout: 5_000 })) {
  133 |       await consulta.click();
  134 |       const dialog = page.locator('[role="dialog"]');
  135 |       await expect(dialog).toBeVisible({ timeout: 5_000 });
  136 |       // Buscar botón de cerrar dentro del dialog
  137 |       await dialog.locator('button[aria-label*="cerrar"], button[aria-label*="Cerrar"], button:has-text("×"), button:has-text("✕")').first().click();
  138 |       await expect(dialog).not.toBeVisible({ timeout: 3_000 });
  139 |     }
  140 |   });
  141 | 
  142 |   test('UAT-HIST-12 | modal SOAP se puede cerrar con Escape', async ({ page }) => {
  143 |     await page.waitForLoadState('networkidle');
```