# Tests e2e (Cypress)

Suite de tests end-to-end de MedSync Frontend. Cubre 5 flujos básicos de la
aplicación sin necesidad de backend, Firebase ni credenciales reales.

## Cómo correrlos

```bash
pnpm e2e          # Headless: levanta el dev server y corre los 5 specs
pnpm e2e:open     # Interactivo: levanta el dev server y abre la UI de Cypress
```

Ambos comandos usan `start-server-and-test`: arrancan `vite --mode e2e` en
`http://localhost:5173`, esperan a que responda y luego ejecutan Cypress.

Si prefieres dos terminales:

```bash
# Terminal 1
pnpm dev:e2e

# Terminal 2
pnpm cy:run       # o pnpm cy:open
```

## Estrategia: sin backend ni Firebase real

El login real depende de Firebase Auth + el backend Quarkus, lo cual haría los
tests lentos y frágiles (credenciales, red, estado compartido). En su lugar:

- **Entorno**: `vite --mode e2e` carga `.env.e2e` (en la raíz del repo), que
  trae valores **dummy** de Firebase. La app arranca normal porque Firebase
  solo valida las credenciales cuando se intenta un sign-in real, cosa que
  ningún spec hace.
- **Sesión simulada**: el comando custom `cy.visitAs(path, role)` (definido en
  `support/commands.ts`) seedea el localStorage con la key `medsync-auth` —
  el mismo storage persistido de Zustand que lee `RequireAuth` — antes de que
  la app cargue. Roles disponibles: `'DOCTOR'` (default) y `'COO'`.
- **API stubbeada**: todas las llamadas a `/api/*` se interceptan con
  `cy.intercept`. Los datos de prueba viven en `fixtures/patients.json` y
  cumplen el `PatientSchema` de Zod (si el schema cambia, hay que actualizar
  el fixture o la app mostrará estado de error).

## Los 5 flujos

| Spec | Flujo | Qué verifica |
|------|-------|--------------|
| `01-login-validation.cy.ts` | Validación del login | Errores de Zod con campos vacíos / email inválido, limpieza del error al reescribir, toggle de mostrar contraseña. No sale ningún request. |
| `02-route-protection.cy.ts` | Protección de rutas | Sin sesión, `/doctor/dashboard` y `/coo/dashboard` redirigen a `/`. Con sesión, el dashboard carga y el header muestra al usuario. Con sesión activa, `/` redirige al dashboard (`RedirectIfAuth`). |
| `03-doctor-patients.cy.ts` | Lista de pacientes | La lista renderiza los pacientes del fixture (nombres + contador), el clic en una tarjeta navega a `/patients/:id/history`, y la API vacía muestra el estado "Aún no tienes pacientes". |
| `04-logout.cy.ts` | Logout | "Cerrar sesión" desde el menú del header regresa al login y las rutas privadas quedan bloqueadas de nuevo. |
| `05-public-pages.cy.ts` | Páginas públicas y 404 | `/privacidad` y `/terminos` cargan sin sesión; una ruta inexistente cae en `/404`. |

## Estructura

```
cypress/
  e2e/                  # Los 5 specs (*.cy.ts)
  fixtures/
    patients.json       # Pacientes de prueba (cumplen PatientSchema)
  support/
    commands.ts         # cy.visitAs() — sesión simulada vía localStorage
    e2e.ts              # Entry point de soporte
  tsconfig.json         # TS aislado del build de la app
```

## Cómo agregar un flujo nuevo

1. Crea `cypress/e2e/NN-nombre-del-flujo.cy.ts`.
2. Si la ruta es privada, usa `cy.visitAs('/ruta', 'DOCTOR' | 'COO')`.
3. Stubbea los endpoints que la página consume con `cy.intercept` **antes**
   del visit (los intercepts definidos al último tienen prioridad, así que
   declara primero los catch-all y después los específicos).
4. Si necesitas data nueva, agrega un fixture en `cypress/fixtures/` que
   cumpla el schema Zod correspondiente de `src/features/*/schemas.ts`.
5. Documenta el flujo en la tabla de arriba.

## Notas

- Los specs corren con test isolation de Cypress: cada `it` arranca con
  localStorage limpio, por eso `cy.visitAs` se llama en cada test.
- `cypress/videos`, `cypress/screenshots` y `cypress/downloads` están en
  `.gitignore`.
- Estos tests **no** validan el backend real; son contratos de UI/routing.
  La integración real con el backend se cubre aparte.
