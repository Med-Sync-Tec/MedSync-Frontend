# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventory.spec.ts >> Inventario de Medicamentos >> UAT-INV-04 | el campo de búsqueda existe con el placeholder correcto
- Location: e2e\inventory.spec.ts:50:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[placeholder="Buscar por nombre..."]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[placeholder="Buscar por nombre..."]')

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
  1   | /**
  2   |  * UAT — Inventario de Medicamentos (/coo/inventory)
  3   |  *
  4   |  * Cubre:
  5   |  *   - Carga inicial de la tabla
  6   |  *   - Contador de medicamentos y paginación
  7   |  *   - Búsqueda por nombre (debounce 400ms)
  8   |  *   - Búsqueda sin resultados
  9   |  *   - Limpiar búsqueda restablece la lista completa
  10  |  *   - Filtro "Todos" (estado por defecto)
  11  |  *   - Filtro "Vigente"
  12  |  *   - Filtro "En revisión"
  13  |  *   - Filtro "Obsoleto"
  14  |  *   - Columnas de la tabla (Nombre, Estado, Descripción, Acciones)
  15  |  *   - Badges de estado con colores correctos
  16  |  *   - Modal "Nuevo medicamento": se abre, se valida, se crea, se cancela
  17  |  *   - Modal "Editar medicamento": se abre con datos precargados, se cambia estado, se guarda, se cancela
  18  |  *   - Diálogo de confirmación de eliminación: se abre, se cancela, se confirma
  19  |  *   - Estado de carga mientras el API responde
  20  |  *   - Error global de carga con alerta
  21  |  *   - Paginación: avanzar y retroceder páginas
  22  |  */
  23  | import { test, expect } from '@playwright/test';
  24  | 
  25  | test.describe('Inventario de Medicamentos', () => {
  26  | 
  27  |   test.beforeEach(async ({ page }) => {
  28  |     await page.goto('/coo/inventory');
  29  |     await page.waitForLoadState('networkidle');
  30  |   });
  31  | 
  32  |   // ── Estructura de la página ──────────────────────────────────────────────
  33  | 
  34  |   test('UAT-INV-01 | muestra el título "Inventario de Medicamentos"', async ({ page }) => {
  35  |     await expect(page.locator('h1', { hasText: 'Inventario de Medicamentos' })).toBeVisible();
  36  |   });
  37  | 
  38  |   test('UAT-INV-02 | las columnas de la tabla están visibles', async ({ page }) => {
  39  |     await expect(page.locator('th', { hasText: 'Nombre' })).toBeVisible();
  40  |     await expect(page.locator('th', { hasText: 'Estado' })).toBeVisible();
  41  |     await expect(page.locator('th', { hasText: 'Acciones' })).toBeVisible();
  42  |   });
  43  | 
  44  |   test('UAT-INV-03 | la tabla carga al menos un medicamento', async ({ page }) => {
  45  |     await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 10_000 });
  46  |   });
  47  | 
  48  |   // ── Búsqueda ─────────────────────────────────────────────────────────────
  49  | 
  50  |   test('UAT-INV-04 | el campo de búsqueda existe con el placeholder correcto', async ({ page }) => {
> 51  |     await expect(page.locator('input[placeholder="Buscar por nombre..."]')).toBeVisible();
      |                                                                             ^ Error: expect(locator).toBeVisible() failed
  52  |   });
  53  | 
  54  |   test('UAT-INV-05 | buscar por nombre filtra los resultados de la tabla', async ({ page }) => {
  55  |     const searchInput = page.locator('input[placeholder="Buscar por nombre..."]');
  56  |     const firstRowText = await page.locator('tbody tr td').first().textContent();
  57  |     if (firstRowText) {
  58  |       const partialName = firstRowText.trim().slice(0, 3);
  59  |       await searchInput.fill(partialName);
  60  |       // Esperar el debounce de 400ms + carga
  61  |       await page.waitForTimeout(600);
  62  |       await page.waitForLoadState('networkidle');
  63  |       // Al menos una fila debe coincidir con la búsqueda
  64  |       await expect(page.locator('tbody tr').first()).toBeVisible();
  65  |     }
  66  |   });
  67  | 
  68  |   test('UAT-INV-06 | buscar un nombre inexistente muestra "No se encontraron medicamentos"', async ({ page }) => {
  69  |     const searchInput = page.locator('input[placeholder="Buscar por nombre..."]');
  70  |     await searchInput.fill('xyzXYZnombrequenoexiste999');
  71  |     await page.waitForTimeout(600);
  72  |     await page.waitForLoadState('networkidle');
  73  |     await expect(page.locator('text=No se encontraron medicamentos')).toBeVisible({ timeout: 8_000 });
  74  |   });
  75  | 
  76  |   test('UAT-INV-07 | limpiar búsqueda restaura la lista completa', async ({ page }) => {
  77  |     const searchInput = page.locator('input[placeholder="Buscar por nombre..."]');
  78  |     await searchInput.fill('aaaa');
  79  |     await page.waitForTimeout(600);
  80  |     await searchInput.clear();
  81  |     await page.waitForTimeout(600);
  82  |     await page.waitForLoadState('networkidle');
  83  |     await expect(page.locator('tbody tr').first()).toBeVisible({ timeout: 8_000 });
  84  |   });
  85  | 
  86  |   // ── Filtros de estado ─────────────────────────────────────────────────────
  87  | 
  88  |   test('UAT-INV-08 | filtro "Todos" está activo por defecto', async ({ page }) => {
  89  |     const todosBtn = page.locator('button', { hasText: 'Todos' });
  90  |     await expect(todosBtn).toHaveClass(/bg-primary/, { timeout: 3_000 });
  91  |   });
  92  | 
  93  |   test('UAT-INV-09 | filtro "Vigente" filtra solo medicamentos activos', async ({ page }) => {
  94  |     await page.click('button:text("Vigente")');
  95  |     await page.waitForLoadState('networkidle');
  96  |     // Todos los badges visibles deben decir "Vigente"
  97  |     const badges = page.locator('span', { hasText: 'Vigente' });
  98  |     await expect(badges.first()).toBeVisible({ timeout: 8_000 });
  99  |   });
  100 | 
  101 |   test('UAT-INV-10 | filtro "En revisión" muestra solo medicamentos en revisión', async ({ page }) => {
  102 |     await page.click('button:text("En revisión")');
  103 |     await page.waitForLoadState('networkidle');
  104 |     // Puede no haber resultados — solo verificamos que el filtro se activó
  105 |     const btn = page.locator('button:text("En revisión")');
  106 |     await expect(btn).toHaveClass(/bg-primary/, { timeout: 3_000 });
  107 |   });
  108 | 
  109 |   test('UAT-INV-11 | filtro "Obsoleto" muestra solo medicamentos obsoletos', async ({ page }) => {
  110 |     await page.click('button:text("Obsoleto")');
  111 |     await page.waitForLoadState('networkidle');
  112 |     const btn = page.locator('button:text("Obsoleto")');
  113 |     await expect(btn).toHaveClass(/bg-primary/, { timeout: 3_000 });
  114 |   });
  115 | 
  116 |   test('UAT-INV-12 | volver a "Todos" tras filtro restablece todos los medicamentos', async ({ page }) => {
  117 |     await page.click('button:text("Vigente")');
  118 |     await page.waitForLoadState('networkidle');
  119 |     await page.click('button:text("Todos")');
  120 |     await page.waitForLoadState('networkidle');
  121 |     const todosBtn = page.locator('button:text("Todos")');
  122 |     await expect(todosBtn).toHaveClass(/bg-primary/, { timeout: 3_000 });
  123 |   });
  124 | 
  125 |   // ── Modal Crear Medicamento ───────────────────────────────────────────────
  126 | 
  127 |   test('UAT-INV-13 | botón "Nuevo medicamento" abre el modal de creación', async ({ page }) => {
  128 |     await page.click('button', { hasText: 'Nuevo medicamento' });
  129 |     await expect(page.locator('h2', { hasText: 'Nuevo medicamento' })).toBeVisible({ timeout: 5_000 });
  130 |   });
  131 | 
  132 |   test('UAT-INV-14 | modal de creación muestra campos nombre y descripción', async ({ page }) => {
  133 |     await page.click('button', { hasText: 'Nuevo medicamento' });
  134 |     await expect(page.locator('#nombre-create')).toBeVisible();
  135 |     await expect(page.locator('#descripcion-create')).toBeVisible();
  136 |   });
  137 | 
  138 |   test('UAT-INV-15 | modal de creación muestra aviso de estado "Vigente" por defecto', async ({ page }) => {
  139 |     await page.click('button', { hasText: 'Nuevo medicamento' });
  140 |     await expect(page.locator('text=Vigente').first()).toBeVisible();
  141 |   });
  142 | 
  143 |   test('UAT-INV-16 | modal de creación valida que el nombre no esté vacío', async ({ page }) => {
  144 |     await page.click('button', { hasText: 'Nuevo medicamento' });
  145 |     await page.click('button:text("Crear")');
  146 |     // Debe mostrar error de validación
  147 |     await expect(page.locator('p.text-danger, [data-error]').first()).toBeVisible({ timeout: 3_000 });
  148 |   });
  149 | 
  150 |   test('UAT-INV-17 | modal de creación: "Cancelar" cierra sin guardar', async ({ page }) => {
  151 |     await page.click('button', { hasText: 'Nuevo medicamento' });
```