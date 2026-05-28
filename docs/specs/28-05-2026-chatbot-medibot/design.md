# Design — MediBot Chat (Frontend)

---

## Arquitectura

```
layouts/
  DoctorLayout.tsx        ← añadir FAB + ChatCard aquí
  CooLayout.tsx           ← añadir FAB + ChatCard aquí

features/chat/
  api.ts                  ← sendChatMessage(text, role) → ChatResponse
  schemas.ts              ← ChatRequestSchema, ChatResponseSchema
  hooks/
    useMediBot.ts         ← estado de mensajes + llamada al API

components/ui/cards/
  ChatCard.tsx            ← hacerlo controlled (messages prop)
```

---

## Hook `useMediBot`

```ts
interface MediBotMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

interface UseMediBotReturn {
  messages: MediBotMessage[];
  isLoading: boolean;
  send: (text: string) => Promise<void>;
  clear: () => void;
}
```

- Al llamar `send(text)`:
  1. Agrega burbuja de usuario a `messages`.
  2. Pone `isLoading = true` (activa indicador de typing).
  3. Llama `sendChatMessage(text)` en `features/chat/api.ts`.
  4. Recibe respuesta y agrega burbuja del bot.
  5. Si hay error, agrega burbuja de bot con mensaje de error genérico.
  6. Pone `isLoading = false`.

---

## API `features/chat/api.ts`

```ts
// POST /api/chat
export async function sendChatMessage(message: string): Promise<string>
```

- Usa `apiFetch` con `auth: true`.
- Parsea respuesta con `ChatResponseSchema`.
- Lanza `ApiError` en caso de error HTTP.

---

## Schemas Zod

```ts
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
});

export const ChatResponseSchema = z.object({
  response: z.string(),
  isCritical: z.boolean(),
});
```

---

## Cambios en `ChatCard`

Actualmente tiene su propio `useState` para mensajes. Se convierte en controlled:

```ts
interface ChatCardProps {
  messages: MediBotMessage[];
  isLoading?: boolean;
  onClose?: () => void;
  onSend: (text: string) => void;
}
```

- Agrega burbuja de typing cuando `isLoading === true`:
  ```tsx
  {isLoading && (
    <div className="flex justify-start">
      <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl rounded-bl-sm">
        <span className="typing-dots">···</span>
      </div>
    </div>
  )}
  ```

---

## Cambios en layouts

Extraer el bloque FAB + ChatCard de `DoctorDashboardPage` y `SavedNewsPage`, y montarlo en `DoctorLayout` y `CooLayout`:

```tsx
// DoctorLayout.tsx (y análogo en CooLayout.tsx)
const { messages, isLoading, send } = useMediBot();
const [chatOpen, setChatOpen] = useState(false);

// dentro del JSX, al final antes de </div>:
<div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end gap-3">
  {chatOpen && (
    <ChatCard
      messages={messages}
      isLoading={isLoading}
      onClose={() => setChatOpen(false)}
      onSend={send}
    />
  )}
  <FAB ... />
</div>
```

---

## Flujo de usuario

```
Usuario abre chat → escribe pregunta → pulsa Enter o botón Send
  → burbuja de usuario aparece
  → indicador de typing aparece
  → backend responde (o error)
  → burbuja del bot reemplaza al typing
```

---

## Manejo de errores

| Caso | Comportamiento |
|------|----------------|
| Red caída / timeout | Burbuja bot: "Ocurrió un error al conectar, intenta de nuevo." |
| Backend 500 | Mismo mensaje genérico |
| Pregunta crítica (`isCritical: true`) | El backend ya responde con mensaje canned; se muestra igual |
| Input vacío | Botón Send deshabilitado, no se llama al API |
