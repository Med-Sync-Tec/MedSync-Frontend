# Tasks — MediBot Chat (Frontend)

**Approach:** Test-Driven Development — escribir el test antes del código.

---

## Setup de testing (prerrequisito — sin esto nada corre)

- [ ] **T-0** Instalar dependencias de testing:
  ```
  pnpm add -D vitest @testing-library/react @testing-library/user-event jsdom
  ```
  Crear `vitest.config.ts` en la raíz del proyecto con:
  ```ts
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';
  import tsconfigPaths from 'vite-tsconfig-paths';

  export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
  });
  ```
  Crear `src/test/setup.ts`:
  ```ts
  import '@testing-library/jest-dom';
  ```
  Instalar también:
  ```
  pnpm add -D @testing-library/jest-dom vite-tsconfig-paths
  ```
  Agregar script en `package.json`: `"test": "vitest run"`.

---

## Schemas y API

- [ ] **T-1** Escribir tests en `src/features/chat/schemas.test.ts`:
  - `ChatRequestSchema` acepta mensaje válido
  - `ChatRequestSchema` rechaza string vacío
  - `ChatRequestSchema` rechaza string de 1001 chars
  - `ChatResponseSchema` acepta `{ response: string, isCritical: boolean }`
- [ ] **T-2** Crear `src/features/chat/schemas.ts` hasta que pasen los tests.
- [ ] **T-3** Escribir tests en `src/features/chat/api.test.ts`:
  - Mock de `apiFetch` (vi.mock)
  - `sendChatMessage("hola")` → llama a `POST /api/chat` con `{ message: "hola" }`
  - Parsea la respuesta con `ChatResponseSchema` y devuelve el string de `response`
  - Lanza error si la respuesta no pasa el schema
- [ ] **T-4** Crear `src/features/chat/api.ts` hasta que pase el test.

---

## Hook `useMediBot`

- [ ] **T-5** Escribir tests en `src/features/chat/hooks/useMediBot.test.ts`:
  - `send("hola")` → agrega mensaje de usuario a `messages`
  - `isLoading` es `true` durante la llamada
  - La respuesta del bot aparece en `messages` tras llamada exitosa
  - En error de red → agrega mensaje bot con texto de error genérico, `isLoading=false`
- [ ] **T-6** Crear `src/features/chat/hooks/useMediBot.ts` hasta que pasen todos los tests.

---

## Componente `ChatCard` (controlled)

- [ ] **T-7** Escribir tests en `src/components/ui/cards/ChatCard.test.tsx`:
  - Renderiza burbujas para cada mensaje en el array `messages` prop
  - Muestra indicador de typing cuando `isLoading === true`
  - Llama `onSend` con el texto cuando el usuario envía un mensaje
  - No llama `onSend` con texto vacío
- [ ] **T-8** Actualizar `ChatCard.tsx` para ser controlled:
  - Recibe `messages: MediBotMessage[]` e `isLoading?: boolean` como props
  - Eliminar el `useState` interno de mensajes
  - Agregar burbuja de typing cuando `isLoading === true`
- [ ] **T-9** Actualizar `ChatCard.stories.tsx` con las nuevas props.

---

## Layouts

- [ ] **T-10** Quitar el bloque FAB + ChatCard + `chatOpen` state de `DoctorDashboardPage.tsx`.
- [ ] **T-11** Quitar el bloque FAB + ChatCard + `chatOpen` state de `SavedNewsPage.tsx`.
- [ ] **T-12** Montar FAB + ChatCard + `useMediBot` en `DoctorLayout.tsx`.
- [ ] **T-13** Montar FAB + ChatCard + `useMediBot` en `CooLayout.tsx`.

---

## QA manual

- [ ] **T-14** Verificar que el chat abre/cierra en todas las páginas del doctor.
- [ ] **T-15** Verificar que el chat abre/cierra en todas las páginas del COO.
- [ ] **T-16** Verificar modo claro y modo oscuro.
- [ ] **T-17** Verificar que el botón Send está deshabilitado con input vacío.
- [ ] **T-18** Verificar respuesta de error (cortar red y enviar mensaje).

---

## Post-ship

- [ ] **T-19** Llenar `summary.md`.
