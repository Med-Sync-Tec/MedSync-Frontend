# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: coo-dashboard.spec.ts >> Dashboard del COO >> UAT-COODASH-15 | se cargan artículos en la lista
- Location: e2e\coo-dashboard.spec.ts:122:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('article, [data-testid="article-card"]').first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('article, [data-testid="article-card"]').first()

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
  - text: ACCESO CONTROLADO
  - heading "Cuentas creadas por administrador, sin registro abierto." [level=2]:
    - text: Cuentas creadas por
    - emphasis: administrador
    - text: ", sin registro abierto."
  - paragraph: Las cuentas se gestionan desde adentro del panel institucional. Cada acceso pasa por Firebase Authentication y respeta el rol asignado.
  - text: Autenticación con Firebase Roles diferenciados
  - tablist:
    - tab "Ir a la diapositiva 1"
    - tab "Ir a la diapositiva 2"
    - tab "Ir a la diapositiva 3" [selected]
  - button "Anterior"
  - button "Siguiente"
```

# Test source

```ts
  25  | 
  26  |   // ── Estructura de la página ──────────────────────────────────────────────
  27  | 
  28  |   test('UAT-COODASH-01 | muestra el encabezado "PANEL OPERACIONES"', async ({ page }) => {
  29  |     await expect(page.locator('text=/PANEL OPERACIONES/i')).toBeVisible({ timeout: 10_000 });
  30  |   });
  31  | 
  32  |   test('UAT-COODASH-02 | muestra la fecha actual en el header', async ({ page }) => {
  33  |     // El dashboard muestra la fecha del día
  34  |     const today = new Date();
  35  |     const year = today.getFullYear().toString();
  36  |     await expect(page.locator(`text=${year}`)).toBeVisible({ timeout: 5_000 });
  37  |   });
  38  | 
  39  |   // ── KPIs vista Explorar ──────────────────────────────────────────────────
  40  | 
  41  |   test('UAT-COODASH-03 | KPI "Artículos PubMed" está visible', async ({ page }) => {
  42  |     await expect(page.locator('text=/Artículos PubMed|Artículos/')).toBeVisible({ timeout: 10_000 });
  43  |   });
  44  | 
  45  |   test('UAT-COODASH-04 | KPI "Sin leer" está visible', async ({ page }) => {
  46  |     await expect(page.locator('text=Sin leer')).toBeVisible({ timeout: 10_000 });
  47  |   });
  48  | 
  49  |   test('UAT-COODASH-05 | KPI "Medicamentos" muestra el total del inventario', async ({ page }) => {
  50  |     await expect(page.locator('text=Medicamentos')).toBeVisible({ timeout: 10_000 });
  51  |   });
  52  | 
  53  |   test('UAT-COODASH-06 | KPI "Alta evidencia" está visible en vista Explorar', async ({ page }) => {
  54  |     await expect(page.locator('text=Alta evidencia').first()).toBeVisible({ timeout: 10_000 });
  55  |   });
  56  | 
  57  |   // ── Toggle Explorar / Guardadas ──────────────────────────────────────────
  58  | 
  59  |   test('UAT-COODASH-07 | se puede cambiar a la vista "Guardadas"', async ({ page }) => {
  60  |     await page.click('text=Guardadas');
  61  |     await expect(page.locator('text=Total Guardados')).toBeVisible({ timeout: 8_000 });
  62  |   });
  63  | 
  64  |   test('UAT-COODASH-08 | KPIs de Guardadas son visibles al cambiar a esa vista', async ({ page }) => {
  65  |     await page.click('text=Guardadas');
  66  |     await expect(page.locator('text=Total Guardados')).toBeVisible();
  67  |     await expect(page.locator('text=Alta Evidencia')).toBeVisible();
  68  |     await expect(page.locator('text=Recientes (48h)')).toBeVisible();
  69  |     await expect(page.locator('text=Colecciones')).toBeVisible();
  70  |   });
  71  | 
  72  |   test('UAT-COODASH-09 | se puede volver a "Explorar" desde "Guardadas"', async ({ page }) => {
  73  |     await page.click('text=Guardadas');
  74  |     await page.click('text=Explorar');
  75  |     await expect(page.locator('text=Sin leer')).toBeVisible({ timeout: 5_000 });
  76  |   });
  77  | 
  78  |   // ── Filtros de artículos ─────────────────────────────────────────────────
  79  | 
  80  |   test('UAT-COODASH-10 | filtro "Alta evidencia" está disponible', async ({ page }) => {
  81  |     const btn = page.locator('button', { hasText: /Alta [Ee]videncia/ }).first();
  82  |     await expect(btn).toBeVisible({ timeout: 8_000 });
  83  |   });
  84  | 
  85  |   test('UAT-COODASH-11 | filtro "Alta evidencia" se activa al hacer clic', async ({ page }) => {
  86  |     const btn = page.locator('button', { hasText: /Alta [Ee]videncia/ }).first();
  87  |     await expect(btn).toBeVisible({ timeout: 8_000 });
  88  |     await btn.click();
  89  |     await expect(btn).toHaveClass(/bg-primary|font-bold|active/, { timeout: 3_000 });
  90  |   });
  91  | 
  92  |   test('UAT-COODASH-12 | filtro "Recientes" filtra artículos de las últimas 48h', async ({ page }) => {
  93  |     const btn = page.locator('button', { hasText: /Recientes/ }).first();
  94  |     await expect(btn).toBeVisible({ timeout: 8_000 });
  95  |     await btn.click();
  96  |     await expect(btn).toHaveClass(/bg-primary|font-bold|active/, { timeout: 3_000 });
  97  |   });
  98  | 
  99  |   test('UAT-COODASH-13 | filtro "Todos" restablece la vista completa', async ({ page }) => {
  100 |     // Activar un filtro y luego volver a Todos
  101 |     const altaBtn = page.locator('button', { hasText: /Alta [Ee]videncia/ }).first();
  102 |     const todosBtn = page.locator('button', { hasText: 'Todos' }).first();
  103 |     if (await altaBtn.isVisible()) {
  104 |       await altaBtn.click();
  105 |       await todosBtn.click();
  106 |       await expect(todosBtn).toHaveClass(/bg-primary|font-bold|active/, { timeout: 3_000 });
  107 |     }
  108 |   });
  109 | 
  110 |   // ── Botón Sincronizar ────────────────────────────────────────────────────
  111 | 
  112 |   test('UAT-COODASH-14 | botón "Sincronizar PubMed" existe y responde al clic', async ({ page }) => {
  113 |     const syncBtn = page.locator('button', { hasText: /Sincronizar/ });
  114 |     await expect(syncBtn).toBeVisible({ timeout: 8_000 });
  115 |     await syncBtn.click();
  116 |     // Debe mostrar spinner o cambiar texto mientras sincroniza
  117 |     await expect(syncBtn).toBeVisible({ timeout: 5_000 });
  118 |   });
  119 | 
  120 |   // ── Lista de artículos ───────────────────────────────────────────────────
  121 | 
  122 |   test('UAT-COODASH-15 | se cargan artículos en la lista', async ({ page }) => {
  123 |     await expect(
  124 |       page.locator('article, [data-testid="article-card"]').first()
> 125 |     ).toBeVisible({ timeout: 15_000 });
      |       ^ Error: expect(locator).toBeVisible() failed
  126 |   });
  127 | 
  128 |   // ── Paginación ───────────────────────────────────────────────────────────
  129 | 
  130 |   test('UAT-COODASH-16 | la paginación aparece cuando hay más de 10 artículos', async ({ page }) => {
  131 |     await page.waitForLoadState('networkidle');
  132 |     const pagination = page.locator('[aria-label*="paginación"], nav[aria-label*="Pagination"], .pagination').first();
  133 |     if (await pagination.isVisible()) {
  134 |       await expect(pagination).toBeVisible();
  135 |     }
  136 |     // Si no hay más de 10 artículos, la paginación no se muestra — test pasa
  137 |   });
  138 | 
  139 | });
  140 | 
```