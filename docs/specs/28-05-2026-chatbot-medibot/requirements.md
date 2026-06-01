# Requirements — MediBot Chat (Frontend)

**Tickets:** EQ3005B-77, 78, 81, 83, 84, 85, 86, 87  
**Fecha:** 28-05-2026

---

## Problema

`ChatCard`, `ChatInput` y `FAB` ya existen como componentes UI, y el FAB está montado en `DoctorDashboardPage` y `SavedNewsPage`. Sin embargo, `onSend` no hace nada: los mensajes del usuario no tienen respuesta y el bot nunca contesta.

---

## Objetivos

1. Conectar el chat al backend (`POST /api/chat`) para que el bot responda.
2. Mostrar indicador de "escribiendo" mientras espera respuesta.
3. Mover el FAB + ChatCard al nivel de layout para que esté disponible en **todas** las páginas del doctor y del COO, no solo en el dashboard.
4. Validar en frontend que la pregunta no esté vacía antes de enviar.

---

## Criterios de aceptación

| ID | Criterio |
|----|----------|
| AC-1 | El doctor o COO puede abrir el chat desde cualquier página de su layout con el FAB. |
| AC-2 | Al enviar un mensaje, aparece una burbuja del usuario inmediatamente. |
| AC-3 | Mientras el backend procesa, se muestra un indicador de "escribiendo..." en la posición del bot. |
| AC-4 | La respuesta del bot aparece como burbuja nueva una vez recibida. |
| AC-5 | Si el backend responde con error, se muestra un mensaje de error en el chat ("Ocurrió un error, intenta de nuevo."). |
| AC-6 | Si el backend indica que la pregunta es crítica, el bot muestra el mensaje canned de seguridad. |
| AC-7 | No se puede enviar un mensaje vacío (botón deshabilitado). |
| AC-8 | El historial de mensajes persiste mientras la sesión está abierta (se limpia al recargar). |
| AC-9 | El chat funciona igual en modo claro y oscuro. |

---

## Fuera de alcance

- Persistencia del historial en base de datos.
- Streaming token a token (se implementará en iteración futura).
- Adjuntar datos del paciente al contexto del chat.
