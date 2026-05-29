# Requirements — Dictado de voz IA para SOAP (Frontend)

**Fecha:** 28-05-2026

---

## Problema

El médico llena el formulario SOAP campo por campo manualmente. Con una consulta activa es difícil tipear y atender al paciente al mismo tiempo. Se necesita una forma de dictar la consulta en lenguaje natural y que la IA distribuya el contenido en los 7 campos automáticamente.

---

## Objetivos

1. Agregar un botón "Dictado IA" en `NewSOAPEntryPage`.
2. El doctor habla libremente describiendo la consulta.
3. Groq Whisper transcribe el audio.
4. Groq LLaMA extrae y distribuye el contenido en los 7 campos del SOAP.
5. El doctor puede editar cualquier campo después.

---

## Criterios de aceptación

| ID | Criterio |
|----|----------|
| AC-1 | Hay un botón "Dictado IA" visible en la parte superior del formulario. |
| AC-2 | Al presionar el botón, el navegador solicita permiso de micrófono. |
| AC-3 | Mientras graba, el botón muestra un indicador visual de grabación activa. |
| AC-4 | Al presionar de nuevo, la grabación se detiene y se inicia el procesamiento. |
| AC-5 | Durante el procesamiento se muestra un estado de carga ("Procesando dictado..."). |
| AC-6 | Los 7 campos del SOAP se llenan con el resultado de la IA. |
| AC-7 | El doctor puede editar cualquier campo después del dictado. |
| AC-8 | Si el micrófono es denegado, se muestra un mensaje de error claro. |
| AC-9 | Si el procesamiento falla, se muestra error y los campos quedan intactos. |
| AC-10 | Funciona en Chrome, Firefox, Edge y Safari (MediaRecorder API). |

---

## Campos del formulario que se llenan

| Campo en form | Descripción |
|---------------|-------------|
| `motivoConsulta` | Motivo de consulta |
| `subjetivo` | Síntomas, antecedentes y preocupaciones |
| `objetivo` | Hallazgos del examen físico |
| `evaluacion` | Evaluación clínica y razonamiento |
| `diagnostico` | Diagnóstico presuntivo o definitivo |
| `plan` | Plan terapéutico y seguimiento |
| `prescripcion` | Medicamentos, dosis, vía y duración |

---

## Fuera de alcance

- Transcripción en tiempo real (streaming).
- Guardar el audio en base de datos.
- Dictado campo por campo (es un solo dictado global).
