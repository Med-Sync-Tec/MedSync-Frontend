# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventory.spec.ts >> Inventario de Medicamentos >> UAT-INV-05 | buscar por nombre filtra los resultados de la tabla
- Location: e2e\inventory.spec.ts:54:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.textContent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('tbody tr td').first()

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
  51  |     await expect(page.locator('input[placeholder="Buscar por nombre..."]')).toBeVisible();
  52  |   });
  53  | 
  54  |   test('UAT-INV-05 | buscar por nombre filtra los resultados de la tabla', async ({ page }) => {
  55  |     const searchInput = page.locator('input[placeholder="Buscar por nombre..."]');
> 56  |     const firstRowText = await page.locator('tbody tr td').first().textContent();
      |                                                                    ^ Error: locator.textContent: Test timeout of 30000ms exceeded.
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
  152 |     await expect(page.locator('h2', { hasText: 'Nuevo medicamento' })).toBeVisible();
  153 |     await page.click('button:text("Cancelar")');
  154 |     await expect(page.locator('h2', { hasText: 'Nuevo medicamento' })).not.toBeVisible({ timeout: 3_000 });
  155 |   });
  156 | 
```