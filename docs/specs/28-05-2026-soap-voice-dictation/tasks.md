# Tasks — Dictado de voz IA para SOAP (Frontend)

**Approach:** TDD — test antes del código.

---

## Prerequisito

- [ ] **T-0** Verificar que `apiFetch` soporte `FormData` como body. Si no, agregar soporte en `src/lib/http/client.ts` para que cuando `body` sea `FormData` se omita el `Content-Type` (axios lo pone automáticamente con el boundary correcto).

---

## Schemas y API

- [ ] **T-1** Escribir tests en `src/features/consultations/schemas.test.ts`:
  - `SOAPDictationResultSchema` acepta objeto con todos los campos
  - `SOAPDictationResultSchema` acepta campos parciales (algunos null/undefined)
  - `SOAPDictationResultSchema` rechaza un string directo
- [ ] **T-2** Agregar `SOAPDictationResultSchema` y `SOAPDictationResult` en `schemas.ts`.
- [ ] **T-3** Escribir tests en `src/features/consultations/sendDictation.test.ts`:
  - Mock de `@lib/http/client` (mockear el módulo `http`, no `apiFetch`)
  - `sendDictation(blob)` llama a `http.post('/api/soap/dictation', formData, ...)`
  - El `FormData` contiene el campo `audio` con filename `dictation.webm`
  - Parsea la respuesta con `SOAPDictationResultSchema`
  - Lanza error si la respuesta no pasa el schema
- [ ] **T-4** Agregar `sendDictation(audio: Blob)` en `api.ts` usando `http` directamente (no `apiFetch` — ver design.md).

---

## Hook `useVoiceDictation`

- [ ] **T-5** Escribir tests en `src/features/consultations/hooks/useVoiceDictation.test.ts`:
  - Estado inicial es `idle`
  - `start()` con micrófono denegado → estado `error`, mensaje correcto
  - `stop()` sin grabación activa → no hace nada
  - `onResult` es llamado con los campos tras procesamiento exitoso
  - Estado pasa a `processing` mientras espera y vuelve a `idle` al terminar
- [ ] **T-6** Crear `src/features/consultations/hooks/useVoiceDictation.ts`.

---

## Componente `DictationButton`

- [ ] **T-7** Escribir tests en `src/features/consultations/components/DictationButton.test.tsx`:
  - Renderiza botón "Dictado IA" en estado idle
  - Al hacer clic llama `start()`
  - En estado `recording` muestra texto de grabación
  - En estado `processing` el botón está deshabilitado
  - En estado `error` muestra el mensaje de error
- [ ] **T-8** Crear `src/features/consultations/components/DictationButton.tsx`.

---

## Integración en `NewSOAPEntryPage`

- [ ] **T-9** Agregar `<DictationButton>` arriba del primer `SOAPSection` en `NewSOAPEntryPage.tsx`.
- [ ] **T-10** El callback `onResult` llama `update()` para cada campo recibido.

---

## QA manual

- [ ] **T-11** Dictar una consulta completa y verificar que los 7 campos se llenan.
- [ ] **T-12** Dictar una consulta parcial (sin prescripción) y verificar que los campos vacíos no se tocan.
- [ ] **T-13** Verificar que el doctor puede editar los campos después del dictado.
- [ ] **T-14** Denegar el micrófono y verificar el mensaje de error.

---

## Post-ship

- [ ] **T-15** Llenar `summary.md`.
