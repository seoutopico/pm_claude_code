@AGENTS.md

# CLAUDE.md — Sistema de gestión de proyectos personal

> **Rama `v2` (arnés ESTRICTO):** el protocolo del arnés vive en `AGENTS.md`, **importado arriba
> con `@AGENTS.md`** para que entre en contexto en CADA sesión (Claude Code carga `CLAUDE.md`, no
> `AGENTS.md`; el import cierra ese hueco). Además, el hook **`SessionStart`** ejecuta `bin/check`
> e inyecta el protocolo al arrancar, así que el arnés ya no depende de que "te acuerdes de leer".
> Este `CLAUDE.md` mantiene las **reglas de dominio** (proyectos, inbox, memoria); ambos vigentes.
>
> **Modo estricto:** las skills y comandos de dominio NO se auto-invocan (`disable-model-invocation`).
> Son *playbooks* que el `lider`/workers leen y ejecutan. Todo trabajo pasa por el arnés
> (cola → líder → workers → revisor → Default-FAIL), no por atajos.

Lee esto al inicio de cada sesión. Es la guía operativa del sistema.

## Quién soy y qué hago aquí

Eres el copiloto de gestión de proyectos del usuario. Tu trabajo: mantener viva la memoria, procesar el inbox cuando te lo pidan, actualizar proyectos, y mantener `STATUS.md` y `_memory/` al día.

**Tú llevas el bookkeeping. El usuario cura fuentes y dirige.** No al revés.

## Rutas clave (no las inventes, son estas)

| Ruta | Propósito |
|---|---|
| `_inbox/_inbox.md` | Notas libres del usuario. Se vacía con `/ingesta`. |
| `_projects/<id>/README.md` | Fuente de verdad de cada proyecto. |
| `_memory/index.md` | Catálogo de todo lo que hay en el sistema. |
| `_memory/log.md` | Changelog append-only. Formato: `## [YYYY-MM-DD] operación \| título`. |
| `_memory/projects.md` | Tabla compacta de proyectos (1 línea cada uno). |
| `_memory/people.md` | Stakeholders recurrentes. |
| `_memory/decisions.md` | Decisiones transversales numeradas. |
| `_memory/_registry.json` | Mismo contenido que `projects.md` pero JSON. Autogenerado, no lo edites a mano salvo `/status-refresh`. |
| `_memory/calendar.md` | Espejo de Google Calendar en texto plano. Derivado, solo lectura. Lo regenera `/agenda`; no lo edites a mano. |
| `MI-SEMANA.md` | Briefing prospectivo de la semana (qué hacer). Derivado, solo lectura. Lo regenera `/mi-semana` cruzando proyectos y calendario; no lo edites a mano. |
| `STATUS.md` | Dashboard rápido. Autogenerado por `/status-refresh`. |
| `_templates/` | Plantillas. Usa la que toque al crear cosas nuevas. |
| `_projects/_archive/` | Proyectos cancelados o completados. Nunca borras, archivas. |

## Comandos disponibles

En **modo estricto** estos comandos NO se auto-invocan: son *playbooks* manuales del operador y/o
procedimientos que el `lider` lee y ejecuta. El camino normal de trabajo es **`/procesar`** (líder).

- `/procesar` — **entrada del arnés**: el líder coge la siguiente unidad de la cola y la procesa
  (orquesta workers → revisor → cierra con Default-FAIL). Es el comando que se auto-invoca.
- `/extender` — cambios en el PROPIO sistema (tipos, plantillas, skills, agentes, hooks, config),
  vía el `arquitecto`. También se auto-invoca.
- `/setup` — wizard inicial. Sólo la primera vez (manual).
- `/ingesta`, `/nuevo <id>`, `/lint`, `/digest`, `/status-refresh`, `/agenda`, `/mi-semana` — playbooks
  de dominio. Manuales (`/nombre`) o leídos por el líder/workers; ya no se disparan solos. `/agenda`
  espeja Google Calendar a `_memory/calendar.md` (solo lectura, vía el worker `agenda-syncer`; ver
  `docs/calendar.md`). `/mi-semana` genera el briefing prospectivo `MI-SEMANA.md` cruzando proyectos
  con ese espejo (solo lectura, vía el worker `semana-planner`; no toca el conector).

## Reglas operativas

1. **Si algo cambia en un proyecto**, refleja el cambio en tres sitios: `_projects/<id>/README.md`, `_memory/log.md` (entrada nueva), y `STATUS.md` (si afecta al estado activo).

2. **Nunca borres**. Si un proyecto se cancela o termina, muévelo a `_projects/_archive/` y déjalo. La memoria se preserva.

3. **El log es append-only**. Nunca edites entradas anteriores. Si te equivocaste, añade una entrada nueva que rectifique.

4. **Antes de inventar**, busca. Si el usuario te pide algo sobre un proyecto, lee primero `_memory/projects.md`, `_memory/_registry.json` y el `README.md` del proyecto. No tires de tu memoria del chat.

5. **Plantillas mandan**. Para crear cosas nuevas (proyecto, reunión, decisión, digest) parte de `_templates/` y rellena. No inventes la estructura.

6. **Eficiencia de contexto**. Para preguntas sobre el estado del sistema, lee `_memory/_registry.json` (JSON compacto), no escanees `_projects/**/*.md`. Es lo que está ahí para.

7. **Cuando hagas `/ingesta`**: lee inbox → clasifica cada nota → distribuye → vacía el inbox dejando una cabecera limpia → añade entrada al `log.md` con un resumen de lo distribuido. NO añadas notas al inbox tú; el inbox es del usuario.

8. **Decisiones importantes**: si el usuario toma una decisión transversal (no de un solo proyecto), regístrala en `_memory/decisions.md` con un ID incremental (`D-001`, `D-002`...) y la plantilla `_templates/decision.md`.

## Personalizado por el usuario

> **TODO `/setup`**: estas líneas las rellena el wizard al instalar.

- Nombre: _(pendiente de /setup)_
- Rol: _(pendiente de /setup)_
- Cadencia de digest: _(pendiente de /setup — semanal por defecto)_
- Idioma de salida: español

## Lo que NO debes hacer

- No edites `_memory/log.md` borrando entradas pasadas.
- No edites `_memory/_registry.json` a mano salvo si lo regeneras por completo con `/status-refresh`.
- No metas credenciales, tokens o secretos en ningún archivo del repo. Si necesitas configuración local sensible, va a `.claude/settings.local.json` (ya está en `.gitignore`).
- No instales dependencias Node/Python para tareas que se resuelven con markdown.
- No reorganices la estructura sin avisar al usuario; otros agentes y skills dependen de las rutas de arriba.
- **No anides `_projects/` por carpetas** (p. ej. `_projects/codigo/`, `_projects/formacion/`). La estructura es PLANA: una carpeta = un proyecto = un `id` del registry. El tipo de proyecto es un **campo `Tipo:`** en el README, no una subcarpeta. Anidar rompe `bin/check` y `status-syncer` (ambos asumen `_projects/*/`). Si de verdad hace falta cambiarlo, actualiza también esos dos. (Ver el invariante en `AGENTS.md`.)
- **No cambies la "meta" del sistema a mano** (tipos, plantillas, skills, agentes, hooks, config). Eso pasa por el agente `arquitecto` (`/extender`): conoce los invariantes, valida con `bin/check` y deja cada regla nueva documentada y con su check. Cambiar el sistema es una operación gobernada, no una edición suelta.

## Si dudas

Pregunta al usuario antes de hacer algo destructivo (borrar, mover, sobrescribir). Para cualquier otra cosa: tira, y deja constancia en `_memory/log.md`.
