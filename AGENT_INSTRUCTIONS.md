# Instrucciones para agentes de IA

Guía de comportamiento para cualquier agente (Claude Code, Copilot, Cursor, etc.) que vaya a escribir o modificar código en este repo. Enfócate en estas reglas — no improvises fuera de ellas.

---

## Antes de escribir código

1. **Lee `Claude.md`** completo — contiene el stack, estructura, patrones y anti-patrones. No empieces sin eso.
2. **Explora antes de editar** — si el task menciona "agregar X a Y", lee Y primero. Usa `grep` / `find` con path aliases para localizar ejemplos existentes del patrón.
3. **Identifica el feature correspondiente** — cualquier lógica de negocio nueva vive en `src/features/<domain>/`, no en `components/ui/` y no suelta en `src/`.
4. **Busca antes de crear** — si ya existe un componente, schema, hook o helper que resuelve el caso (aunque sea parcialmente), extiéndelo en vez de duplicar.

---

## Flujo de trabajo

Para cambios no triviales (más de 1 archivo o nueva funcionalidad):

1. **Plan corto** (mental o explícito según el scope):
   - Qué archivos vas a tocar
   - Qué patrón existente vas a seguir
   - Qué validaciones / tests / stories agregarás
2. **Implementar en pasos pequeños**, cada uno dejando la app en estado compilable
3. **Verificar** (gates obligatorios — no marques tarea como completa sin esto):
   - `pnpm build` → verde
   - `pnpm lint` → 0 errors, 0 warnings
4. **Resumir el diff** al usuario: archivos creados/modificados, impacto funcional, cómo probarlo

---

## Gates obligatorios antes de reportar "terminado"

| Check | Comando | Debe |
|-------|---------|------|
| TypeScript + build | `pnpm build` | Pasar sin errores ni warnings nuevos |
| Lint | `pnpm lint` | 0 errors, 0 warnings |
| Hex literales | `grep -rE '#[0-9a-fA-F]{6}' src --include='*.tsx' --include='*.ts'` | Devolver vacío en archivos no-story |
| No `any` | revisar manualmente | Usar `unknown` + type guards |

Si algo falla, **no reportes éxito**; arregla la causa raíz antes de seguir.

---

## Reglas de código duras

Estas reglas vienen de decisiones ya tomadas en el proyecto. No las negocies sin confirmar con el usuario.

**Estilo:**
- Inmutabilidad obligatoria (spread, no mutación)
- Muchos archivos pequeños > un archivo grande
- Sin comentarios salvo que expliquen un WHY no obvio (constraint oculto, invariante sutil, workaround)
- Sin emojis en código ni texto

**TypeScript:**
- `import type { X }` para imports solo-tipo (verbatimModuleSyntax está activo)
- Nunca `any` — usar `unknown` y estrechar con type guards
- Nunca `as Type` salvo casos justificados; usar Zod
- Prohibidos enums y namespaces (erasableSyntaxOnly)

**Styling:**
- Cero hex literales (`bg-[#xxx]`, `text-[#xxx]`) — usar tokens definidos en `src/index.css`
- Si necesitas un color nuevo, agrégalo como token semántico con nombre conceptual (`--color-caution`, no `--color-orange`)
- Redefine tokens bajo `.dark` para el modo oscuro, no uses prefijo `dark:` para colores de marca

**Rutas y navegación:**
- Solo `useNavigate()` / `<Navigate>` / `<Link>` — jamás `window.location.href`
- Nuevas rutas privadas van dentro del bloque `RequireAuth + DoctorLayout` de `src/routes/index.tsx`

**Datos:**
- Nunca `fetch` directo — usar `apiFetch<T>` de `@lib/http/client`
- Toda respuesta de backend pasa por un schema Zod con `.parse()`
- Mocks en `src/mocks/` deben estar validados con `.parse()` al importar

**Seguridad:**
- Cero secretos hardcodeados (API keys, passwords, tokens) — todo via `env.ts`
- Cero credenciales mock en código productivo (si existen para demo, documentar con TODO de remoción)
- Valida input de usuario en boundaries con Zod

---

## Qué requiere confirmación explícita del usuario

No hagas esto sin preguntar, incluso si parece obvio:

- **Destructivo en git:** `push --force`, `reset --hard`, borrar branches, amend a commits ya empujados
- **Cambios en `main`** o merges directos
- **Borrar archivos o carpetas** que no creaste en la misma sesión
- **Agregar dependencias pesadas** (>100KB gzip) — propón alternativas ligeras primero
- **Cambios en `tsconfig`, `eslint.config`, `vite.config`** — afecta a todo el equipo
- **Romper API pública** (firmas de componentes UI exportados, funciones de `api.ts`, shape de stores)
- **Cambios en `.env.example`** o variables de entorno nuevas
- **Renombrar carpetas** del feature layer o UI layer

---

## Qué NO hacer

- **No crear docs/README** salvo que el usuario lo pida explícitamente
- **No agregar comentarios explicativos** del estilo "// agregado para X" o "// TODO refactor esto"
- **No dejar `console.log`** en código — el lint lo detecta
- **No escribir tests de validación** para cosas que TypeScript ya garantiza
- **No agregar error handling** para escenarios que no pueden ocurrir (confía en guarantees internos del framework; solo valida boundaries)
- **No usar Context para server state** — eso es TanStack Query (cuando se integre) o fetch directo
- **No prop-drill auth** — lee el store con `useAuthStore(selector)`
- **No duplicar schemas** — si ya existe en `features/*/schemas.ts`, extiende (`.pick`, `.omit`, `.extend`)
- **No tocar `src/components/ui/*` para lógica de negocio** — esos son átomos genéricos

---

## Comunicación con el usuario

- **Responde siempre en español** (el proyecto es en español y los colaboradores también)
- **Sé conciso** — sin resúmenes innecesarios, sin reintroducir contexto que el usuario ya tiene
- **Cita `file_path:line` cuando refieras código** — permite click-to-navigate
- **Antes de un refactor grande**, lista archivos impactados y pide OK
- **Al terminar una tarea**, resume en 2-3 líneas: qué cambió, cómo probarlo, siguiente paso sugerido
- **No prometas más de lo que haces** — si algo quedó fuera del scope, dilo explícito

---

## Commits y PRs

**Formato del commit:**
- Título corto (< 70 chars), en imperativo, en español
- Prefijo tipo conventional commits o ticket del proyecto: `feat:`, `refactor:`, `fix:`, `docs:`, `[EQ3005B-NNN]`
- Cuerpo con bullets si el cambio es multi-parte
- **No incluir `Co-Authored-By` ni atribución de agentes** (regla del proyecto)

**Antes de commit:**
- Build y lint verdes
- No archivos de secretos en el stage (`.env.local`, credenciales)
- Agrega archivos por nombre o con `git add <ruta>`, evita `git add -A` ciego

**Push:**
- Preguntar al usuario antes de `git push` (no asumir)
- Nunca `--force` a `main` o `dev` sin permiso escrito

---

## Cuando el usuario dice "hazlo tú"

Si el usuario delega decisiones, opera bajo estas reglas sin preguntar detalles menores:
- Sigue los patrones de `Claude.md` al pie de la letra
- Prefiere la opción con menos cambios y más alineada a lo existente
- Reporta decisiones tomadas al final, no pidas aprobación de cada una

Si una decisión tiene tradeoffs importantes (deprecar una API pública, cambiar stack, etc.), sí pregunta — aunque parezca trivial.

---

## Checklist rápida antes de entregar

- [ ] `pnpm build` verde
- [ ] `pnpm lint` sin errores ni warnings
- [ ] 0 hex literales nuevos
- [ ] 0 `any` nuevos
- [ ] 0 `console.log` nuevos
- [ ] 0 `window.location.href` nuevos
- [ ] Imports con path aliases (no `../../../`)
- [ ] Nuevos datos de red pasan por `apiFetch` + schema Zod
- [ ] Strings de UI en español
- [ ] Commit no incluye `.env.local` ni secretos
