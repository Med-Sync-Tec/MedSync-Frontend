# Design — Dictado de voz IA para SOAP (Frontend)

---

## Flujo completo

```
Doctor presiona "Dictado IA"
  → MediaRecorder graba audio (webm/opus o mp4)
Doctor presiona "Detener"
  → Blob de audio → POST /api/soap/dictation (multipart/form-data)
    → Backend: Groq Whisper → transcript
    → Backend: Groq LLaMA → JSON con 7 campos
  ← { motivoConsulta, subjetivo, objetivo, evaluacion, diagnostico, plan, prescripcion }
  → update() de cada campo en el form
Doctor revisa y edita
```

---

## Nuevos archivos

```
features/consultations/
  hooks/
    useVoiceDictation.ts     ← graba audio, llama al API, rellena el form
  api.ts                     ← agregar sendDictation(blob) → SOAPDictationResult
  schemas.ts                 ← agregar SOAPDictationResultSchema
  components/
    DictationButton.tsx      ← botón con estados: idle / recording / processing
```

---

## Hook `useVoiceDictation`

```ts
type DictationState = 'idle' | 'recording' | 'processing' | 'error';

interface UseVoiceDictationReturn {
  state: DictationState;
  start: () => Promise<void>;   // solicita micrófono, inicia MediaRecorder
  stop: () => void;             // detiene grabación, dispara procesamiento
  error: string | null;
}
```

- `start()`: llama `navigator.mediaDevices.getUserMedia({ audio: true })`, crea `MediaRecorder`, acumula chunks en un array.
- `stop()`: detiene `MediaRecorder`, construye `Blob`, llama `sendDictation(blob)`, llama el callback `onResult(fields)`.
- Recibe `onResult: (fields: Partial<SOAPDictationResult>) => void` como parámetro para que `NewSOAPEntryPage` pueda llamar `update()` por cada campo.

---

## Schema `SOAPDictationResultSchema`

```ts
export const SOAPDictationResultSchema = z.object({
  motivoConsulta: z.string().optional(),
  subjetivo:      z.string().optional(),
  objetivo:       z.string().optional(),
  evaluacion:     z.string().optional(),
  diagnostico:    z.string().optional(),
  plan:           z.string().optional(),
  prescripcion:   z.string().optional(),
});
export type SOAPDictationResult = z.infer<typeof SOAPDictationResultSchema>;
```

Todos opcionales — si la IA no infiere un campo, simplemente no lo llena.

---

## API `sendDictation`

`apiFetch` solo acepta `body: Json` — no soporta `FormData`. Para el audio usamos
`http` (el cliente axios exportado de `@lib/http/client`) directamente:

```ts
// features/consultations/api.ts
import { http } from '@lib/http/client';
import { auth } from '@lib/firebase/client';

export async function sendDictation(audio: Blob): Promise<SOAPDictationResult> {
  const formData = new FormData();
  formData.append('audio', audio, 'dictation.webm');

  const token = await auth.currentUser?.getIdToken();
  const response = await http.post<unknown>('/api/soap/dictation', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Content-Type lo pone axios automáticamente con el boundary correcto
    },
  });
  return SOAPDictationResultSchema.parse(response.data);
}
```

> Usar `http` directamente es la excepción justificada aquí: `FormData` requiere que
> axios maneje el `Content-Type` con boundary, lo cual `apiFetch` no soporta.

---

## Componente `DictationButton`

```tsx
interface DictationButtonProps {
  onResult: (fields: Partial<SOAPDictationResult>) => void;
}
```

Estados visuales:
| Estado | Apariencia |
|--------|------------|
| `idle` | Botón primario con ícono de micrófono "Dictado IA" |
| `recording` | Botón rojo pulsante, ícono de stop, texto "Grabando... (toca para detener)" |
| `processing` | Botón deshabilitado con spinner, texto "Procesando dictado..." |
| `error` | Botón vuelve a idle, mensaje de error debajo |

---

## Integración en `NewSOAPEntryPage`

Agregar arriba del primer `SOAPSection`:

```tsx
<DictationButton
  onResult={(fields) => {
    Object.entries(fields).forEach(([key, value]) => {
      if (value) update(key as keyof FormState, value);
    });
  }}
/>
```

---

## Manejo de errores

| Caso | Comportamiento |
|------|----------------|
| Micrófono denegado | Error: "Permiso de micrófono denegado. Actívalo en la configuración del navegador." |
| MediaRecorder no soportado | Error: "Tu navegador no soporta grabación de audio." |
| Backend 502 (Whisper falla) | Error: "No se pudo procesar el audio. Intenta de nuevo." |
| Backend 500 | Error genérico |
| Campos vacíos del resultado | Se ignoran — el campo queda como estaba |
