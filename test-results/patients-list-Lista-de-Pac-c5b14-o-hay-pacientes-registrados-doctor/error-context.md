# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: patients-list.spec.ts >> Lista de Pacientes >> UAT-PAT-06 | muestra estado vacío cuando no hay pacientes registrados
- Location: e2e\patients-list.spec.ts:62:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Aún no tienes pacientes')
Expected: visible
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 8000ms
  - waiting for locator('text=Aún no tienes pacientes')

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
  2   |  * UAT — Lista de Pacientes (/doctor/patients)
  3   |  *
  4   |  * Cubre:
  5   |  *   - Carga de la lista de pacientes
  6   |  *   - Contador de pacientes en el header y en la barra
  7   |  *   - Estado de carga (skeletons)
  8   |  *   - Estado vacío ("Aún no tienes pacientes")
  9   |  *   - Estado de error con botón "Reintentar"
  10  |  *   - Clic en paciente navega a su historial
  11  |  *   - Botón "Nuevo paciente" abre el modal
  12  |  *   - Modal: validación de campos requeridos
  13  |  *   - Modal: se puede cancelar sin crear
  14  |  *   - Modal: creación exitosa redirige al historial
  15  |  *   - Modal: error al crear muestra alerta
  16  |  *   - Cada tarjeta muestra nombre, ID y estado del paciente
  17  |  *   - Estado "estable" / "alta" en las tarjetas
  18  |  */
  19  | import { test, expect } from '@playwright/test';
  20  | 
  21  | test.describe('Lista de Pacientes', () => {
  22  | 
  23  |   test.beforeEach(async ({ page }) => {
  24  |     await page.goto('/doctor/patients');
  25  |     await page.waitForLoadState('networkidle');
  26  |   });
  27  | 
  28  |   // ── Estructura de la página ──────────────────────────────────────────────
  29  | 
  30  |   test('UAT-PAT-01 | muestra el heading "Gestión de pacientes"', async ({ page }) => {
  31  |     await expect(page.locator('h1', { hasText: 'Gestión de pacientes' })).toBeVisible();
  32  |   });
  33  | 
  34  |   test('UAT-PAT-02 | muestra el total de pacientes en el subtítulo', async ({ page }) => {
  35  |     await expect(
  36  |       page.locator('text=/\\d+ pacientes? registrad/')
  37  |     ).toBeVisible({ timeout: 10_000 });
  38  |   });
  39  | 
  40  |   test('UAT-PAT-03 | la barra superior muestra el conteo de resultados', async ({ page }) => {
  41  |     await expect(page.locator('text=/\\d+ resultado/')).toBeVisible({ timeout: 10_000 });
  42  |   });
  43  | 
  44  |   test('UAT-PAT-04 | texto de ayuda indica que se puede hacer clic para ver historial', async ({ page }) => {
  45  |     await expect(page.locator('text=Haz clic en un paciente para abrir su historial')).toBeVisible();
  46  |   });
  47  | 
  48  |   // ── Estado de carga ──────────────────────────────────────────────────────
  49  | 
  50  |   test('UAT-PAT-05 | muestra esqueletos de carga mientras se obtienen los pacientes', async ({ page }) => {
  51  |     // Interceptar para ralentizar la respuesta
  52  |     await page.route('**/api/patients**', async (route) => {
  53  |       await new Promise((r) => setTimeout(r, 1_500));
  54  |       await route.continue();
  55  |     });
  56  |     await page.goto('/doctor/patients');
  57  |     await expect(page.locator('text=Cargando…')).toBeVisible({ timeout: 5_000 });
  58  |   });
  59  | 
  60  |   // ── Estado vacío ─────────────────────────────────────────────────────────
  61  | 
  62  |   test('UAT-PAT-06 | muestra estado vacío cuando no hay pacientes registrados', async ({ page }) => {
  63  |     await page.route('**/api/patients**', (route) => {
  64  |       route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  65  |     });
  66  |     await page.goto('/doctor/patients');
> 67  |     await expect(page.locator('text=Aún no tienes pacientes')).toBeVisible({ timeout: 8_000 });
      |                                                                ^ Error: expect(locator).toBeVisible() failed
  68  |   });
  69  | 
  70  |   // ── Estado de error ──────────────────────────────────────────────────────
  71  | 
  72  |   test('UAT-PAT-07 | muestra estado de error cuando falla la carga', async ({ page }) => {
  73  |     await page.route('**/api/patients**', (route) => {
  74  |       route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Internal Server Error' }) });
  75  |     });
  76  |     await page.goto('/doctor/patients');
  77  |     await expect(page.locator('text=Error al cargar pacientes')).toBeVisible({ timeout: 8_000 });
  78  |   });
  79  | 
  80  |   test('UAT-PAT-08 | botón "Reintentar" vuelve a llamar al API tras error', async ({ page }) => {
  81  |     let callCount = 0;
  82  |     await page.route('**/api/patients**', (route) => {
  83  |       callCount++;
  84  |       if (callCount === 1) {
  85  |         route.fulfill({ status: 500, body: '{}' });
  86  |       } else {
  87  |         route.continue();
  88  |       }
  89  |     });
  90  |     await page.goto('/doctor/patients');
  91  |     await expect(page.locator('text=Reintentar')).toBeVisible({ timeout: 8_000 });
  92  |     await page.click('text=Reintentar');
  93  |     // Debe intentar recargar (callCount debe incrementar)
  94  |     await page.waitForTimeout(1_000);
  95  |     expect(callCount).toBeGreaterThan(1);
  96  |   });
  97  | 
  98  |   // ── Tarjetas de pacientes ────────────────────────────────────────────────
  99  | 
  100 |   test('UAT-PAT-09 | cada tarjeta de paciente muestra nombre, ID y estado', async ({ page }) => {
  101 |     const firstCard = page.locator('li').first();
  102 |     await expect(firstCard).toBeVisible({ timeout: 10_000 });
  103 |     // La tarjeta debe tener al menos texto de nombre (no vacía)
  104 |     await expect(firstCard).not.toBeEmpty();
  105 |   });
  106 | 
  107 |   test('UAT-PAT-10 | clic en una tarjeta de paciente navega a su historial', async ({ page }) => {
  108 |     const firstCard = page.locator('li').first();
  109 |     await expect(firstCard).toBeVisible({ timeout: 10_000 });
  110 |     await firstCard.click();
  111 |     await expect(page).toHaveURL(/\/patients\/.+\/history/, { timeout: 8_000 });
  112 |   });
  113 | 
  114 |   // ── Modal Nuevo Paciente ─────────────────────────────────────────────────
  115 | 
  116 |   test('UAT-PAT-11 | botón "Nuevo paciente" abre el modal', async ({ page }) => {
  117 |     await page.click('button', { hasText: 'Nuevo paciente' });
  118 |     // El modal debe aparecer — buscar por heading o role=dialog
  119 |     await expect(
  120 |       page.locator('[role="dialog"], [aria-modal="true"]').or(page.locator('text=Nuevo paciente').nth(1))
  121 |     ).toBeVisible({ timeout: 5_000 });
  122 |   });
  123 | 
  124 |   test('UAT-PAT-12 | modal se puede cerrar con el botón cancelar', async ({ page }) => {
  125 |     await page.click('button', { hasText: 'Nuevo paciente' });
  126 |     const cancelBtn = page.locator('button', { hasText: /[Cc]ancelar/ });
  127 |     await expect(cancelBtn).toBeVisible({ timeout: 5_000 });
  128 |     await cancelBtn.click();
  129 |     await expect(cancelBtn).not.toBeVisible({ timeout: 3_000 });
  130 |   });
  131 | 
  132 |   test('UAT-PAT-13 | modal valida que el nombre del paciente no esté vacío', async ({ page }) => {
  133 |     await page.click('button', { hasText: 'Nuevo paciente' });
  134 |     // Intentar guardar sin rellenar campos
  135 |     const saveBtn = page.locator('button', { hasText: /[Gg]uardar|[Cc]rear/ });
  136 |     await expect(saveBtn).toBeVisible({ timeout: 5_000 });
  137 |     await saveBtn.click();
  138 |     // Debe mostrar error de validación
  139 |     await expect(page.locator('p.text-danger, [data-error]').first()).toBeVisible({ timeout: 3_000 });
  140 |   });
  141 | 
  142 |   test('UAT-PAT-14 | modal cierra y navega al historial tras crear paciente exitosamente', async ({ page }) => {
  143 |     // Mockear el POST para no crear un paciente real
  144 |     await page.route('**/api/patients', (route) => {
  145 |       if (route.request().method() === 'POST') {
  146 |         route.fulfill({
  147 |           status: 201,
  148 |           contentType: 'application/json',
  149 |           body: JSON.stringify({
  150 |             id: 'test-uuid-001',
  151 |             nombre: 'Paciente De Prueba',
  152 |             expedienteExternoId: 'EXP-001',
  153 |             activo: true,
  154 |             fechaNacimiento: '1990-01-01',
  155 |             genero: 'masculino',
  156 |           }),
  157 |         });
  158 |       } else {
  159 |         route.continue();
  160 |       }
  161 |     });
  162 |     await page.click('button', { hasText: 'Nuevo paciente' });
  163 |     // Rellenar el nombre (selector genérico — depende del componente NewPatientModal)
  164 |     const nombreInput = page.locator('input[name="nombre"], input[id*="nombre"], input[placeholder*="paciente"]').first();
  165 |     if (await nombreInput.isVisible()) {
  166 |       await nombreInput.fill('Paciente De Prueba');
  167 |       await page.locator('button', { hasText: /[Gg]uardar|[Cc]rear/ }).click();
```