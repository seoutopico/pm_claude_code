# AGENTS.md — Punto de entrada del arnés (claude.pm V2)

> **Esto es lo primero que lee cualquier agente en este repo (rama `v2`).**
> Define el protocolo, el mapa del repo y las reglas. Las reglas de dominio (cómo se
> gestionan proyectos, inbox, memoria) están en `CLAUDE.md` y siguen vigentes.

La V2 es la V1 envuelta en un **arnés**: un protocolo de arranque que verifica salud, una cola
de trabajo explícita, y un contrato que impide declarar algo "hecho" sin demostrarlo. El modelo
es el cerebro intercambiable; este arnés se queda.

---

## Protocolo de sesión (síguelo SIEMPRE)

> **Arranque automático:** el hook **`SessionStart`** (`.claude/hooks/session-start.*`) ya ejecuta
> el paso 1 (`bin/check`) e inyecta este protocolo en cada sesión (`startup|resume|clear|compact`).
> No dependes de acordarte de leer este fichero: el arnés se engancha solo al arrancar.

```
1. (Automático vía SessionStart) Check de salud. Si quieres relanzarlo a mano:
     Windows:     powershell -NoProfile -File bin/check.ps1
     mac/linux:   bash bin/check.sh
   → Si sale con error (exit 1), PARA y reporta. No se trabaja sobre un sistema roto.

2. Lee _progress/actual.md   → ¿quedó algo a medias en la última sesión?
3. Lee _cola/trabajo.json    → coge UNA unidad con "done": false (una sola, no multitarea).
4. ORQUESTA: adopta el rol de líder (.claude/agents/lider.md) o lanza /procesar.
     El líder reparte el trabajo a los workers (cada uno deja su resultado en _progress/<run-id>/).
5. VERIFICA: lanza al revisor (.claude/agents/revisor.md). Devuelve PASS o NEEDS_WORK.
6. Si PASS: aplica el invariante de las TRES ESCRITURAS y marca la unidad "done": true.
     → El hook verify-gate ejecutará el check; si no pasa, NO te dejará marcarlo.
     Si NEEDS_WORK: itera con los hallazgos. No marques nada hecho.
7. Registra en _progress/history.md, limpia _progress/actual.md y, si procede, commit.
```

---

## El contrato Default-FAIL (no negociable)

> Por defecto, **nada está hecho**. Una unidad solo pasa a `"done": true` cuando se demuestra.

Una unidad de `_cola/trabajo.json` se puede cerrar **solo si**:

1. Se cumplen las **tres escrituras** (regla operativa nº1 de `CLAUDE.md`):
   - `_projects/<id>/README.md` del proyecto afectado, actualizado.
   - Entrada nueva en `_memory/log.md` (append-only).
   - `STATUS.md` refrescado si cambia el estado activo.
2. `bin/check` sale con **exit 0**.

El hook **`.claude/hooks/verify-gate`** intercepta cualquier intento de escribir `"done": true`
en `_cola/trabajo.json`: si `check` no pasa, **bloquea la escritura**. La regla deja de
depender de tu memoria y pasa a ser un invariante que el sistema hace cumplir.

---

## ⚙️ Modo ESTRICTO: el arnés se hace cumplir (no es opcional)

> Este es el corazón del arreglo de mayo de 2026. El problema que resolvía: el arnés estaba
> **bien diseñado pero solo enganchado a medias**, así que al pedir trabajo en lenguaje natural
> ("crea proyectos", "procesa esto") Claude Code disparaba la skill de dominio directamente y
> se saltaba la orquestación y la verificación — perdiendo la esencia del arnés.

Tres enganches deterministas lo impiden ahora (los tres los verifica `bin/check`, sección 6):

1. **El protocolo entra en contexto siempre.** `CLAUDE.md` importa `@AGENTS.md` y el hook
   `SessionStart` inyecta el protocolo al arrancar. *(Claude Code carga `CLAUDE.md`, no `AGENTS.md`;
   y aun cargado, una instrucción en markdown es contexto, no configuración forzada — por eso hace
   falta también el hook.)*
2. **Las skills/comandos de dominio NO se auto-invocan** (`disable-model-invocation: true`). El
   modelo ya no puede coger el atajo. Pasan a ser **playbooks** (ver tabla abajo).
3. **El cierre está blindado** por el `verify-gate` (Default-FAIL) más arriba.

**Regla de oro:** *para hacer trabajo del usuario, NO ejecutes una skill de dominio.* Conviértelo
en unidad(es) de la cola y procésalo como **líder** (orquesta workers → revisor → cierra). El
único atajo legítimo es el del operador (Aina) tecleando `/nombre` a mano.

### Playbooks (skills/comandos de dominio que LEES y ejecutas, no auto-invocas)

| Playbook | Para qué | Quién lo ejecuta |
|---|---|---|
| `.claude/skills/nuevo-proyecto/SKILL.md` | Crear un proyecto desde plantilla | líder/worker (lo lee y aplica) |
| `.claude/skills/ingesta/SKILL.md` | Procesar y distribuir notas del inbox | líder + `inbox-classifier` |
| `.claude/skills/status-refresh/SKILL.md` | Regenerar STATUS + registry | `status-syncer` |
| `.claude/skills/digest/SKILL.md` | Resumen periódico | líder |
| `.claude/skills/wiki-lint/SKILL.md` | Health check de contenido | líder/revisor |
| `.claude/skills/agenda/SKILL.md` | Espejar Google Calendar a `_memory/calendar.md` (solo lectura) | líder + `agenda-syncer` |
| `.claude/skills/mi-semana/SKILL.md` | Briefing prospectivo "qué hacer esta semana" → `MI-SEMANA.md` (proyectos × calendar.md, solo lectura) | líder + `semana-planner` |

Comandos auto-invocables (las dos puertas gobernadas): **`/procesar`** (líder, procesa la cola) y
**`/extender`** (arquitecto, cambia el sistema). Todo lo demás es manual o playbook.

---

## Mapa del repo (no releas todo; ve directo)

| Ruta | Qué es | Capa |
|---|---|---|
| `AGENTS.md` | Este protocolo. Punto de entrada. | arnés |
| `CLAUDE.md` | Reglas de dominio (proyectos, inbox, memoria). | dominio (V1) |
| `bin/check.sh` / `bin/check.ps1` | Gate de salud. Verifica invariantes. Exit 0/1. | arnés |
| `_cola/trabajo.json` | Cola de trabajo. Unidades con `done:false`. | arnés |
| `_progress/actual.md` | Ejecución en curso (se limpia al cerrar). | arnés |
| `_progress/history.md` | Changelog append-only de ejecuciones. | arnés |
| `_control/STOP` | Si existe → parar (kill-switch). | arnés |
| `_control/STEER.md` | Si tiene contenido → redirige sin reiniciar. | arnés |
| `.claude/agents/` | Líder, revisor, arquitecto y los workers (subagentes V1). | arnés |
| `.claude/hooks/` | `verify-gate`, etc. | arnés |
| `_inbox/_inbox.md` | Notas del usuario. **El arnés nunca escribe aquí.** | dominio |
| `_projects/<id>/README.md` | Fuente de verdad de cada proyecto. | dominio |
| `_memory/_registry.json` | Tabla de proyectos en JSON. Contexto rápido. | dominio |
| `_memory/calendar.md` | Espejo del calendario (derivado, solo lectura). Lo regenera `/agenda`. | dominio |
| `MI-SEMANA.md` | Briefing prospectivo de la semana (derivado, solo lectura). Lo regenera `/mi-semana`. | dominio |
| `.mcp.json` | Conectores MCP (Google Calendar, solo lectura). | arnés |
| `_memory/log.md` | Changelog del sistema. Append-only. | dominio |
| `_templates/` | Plantillas. Mandan al crear cosas nuevas. | dominio |
| `STATUS.md` | Dashboard. | dominio |

**Eficiencia de contexto**: para saber el estado del sistema, lee `_memory/_registry.json`
(JSON compacto). No escanees `_projects/**/*.md`.

---

## ⚠️ Invariante de estructura: `_projects/` es PLANO

> Si vas a organizar proyectos por tipo (código, formación, ponencias, colaboraciones…), lee
> esto ANTES de mover nada.

`_projects/` tiene **un solo nivel**: cada subcarpeta directa es UN proyecto y su nombre es el
`id` del `_memory/_registry.json` (única excepción: `_archive/`).

- **NO crees subcarpetas por tipo** (`_projects/codigo/`, `_projects/formacion/`…) ni ningún
  nivel intermedio.
- El **tipo** de un proyecto es un **campo `Tipo:`** en su `README.md` (y en el registry), no una
  carpeta. Materiales (PPTs, PDFs) van dentro del proyecto (`_projects/<id>/docs/`). El
  calendario es un concepto aparte (`_memory/calendar.md`), no una jerarquía de carpetas.
- **Por qué** (la consecuencia real): `bin/check` (chequeo de huérfanos) y `status-syncer`
  (`Glob _projects/*/README.md`) asumen estructura plana. Anidar por carpetas **rompe el gate de
  salud y el dashboard en silencio**.

Cambiar esto es legítimo (el arnés es tuyo), pero exige actualizar también `bin/check`,
`status-syncer` y el schema de `_registry.json`. Es una decisión deliberada, no un reorden casual.

---

## Cambiar el sistema mismo → el `arquitecto`

¿Añadir un tipo de proyecto, una plantilla, un skill, un agente, un hook, o personalizar la
config? **Eso no se hace a mano**: pasa por el agente `arquitecto` (comando `/extender`). Conoce
los invariantes, imita las convenciones existentes, **documenta toda regla nueva Y le añade su
check a `bin/check`**, y valida antes de cerrar. Así, extender el sistema nunca lo rompe — y cada
regla nueva nace junto a quien la hace cumplir. (Gestionar proyectos/notas es el `lider`, no el
arquitecto.)

---

## Modelos (presupuesto del arnés)

Cada agente declara su cerebro en el frontmatter de `.claude/agents/*.md`. Principio: cerebro
barato para trabajo mecánico, caro solo para juicio.

| Agente | Modelo |
|---|---|
| `lider` (orquestador) | Sonnet |
| workers (`inbox-classifier`, `project-updater`, `status-syncer`, `wiki-maintainer`, `agenda-syncer`, `semana-planner`) | Haiku |
| `revisor` (evaluador) | Sonnet |
| `arquitecto` (mantenedor del sistema) | Sonnet |

El **líder** es el rol que adopta la sesión principal al procesar la cola (lánzalo con
`/procesar`): lee la cola, reparte a los workers y cierra. El **revisor** se lanza como
subagente con contexto limpio y sin permisos de escritura para verificar antes de cerrar.

---

## Controles del operador (tú)

- **Parar en seco**: crea el fichero `_control/STOP`. El hook `kill-switch` (PreToolUse) bloquea
  cualquier acción mientras exista. Bórralo para reanudar.
- **Redirigir sin reiniciar**: escribe en `_control/STEER.md`. El hook `steer` (UserPromptSubmit)
  inyecta su contenido en el turno y lo vacía.
- **Auto-commit al cerrar** (opcional): crea `_control/AUTOCOMMIT` y el hook `commit-on-stop` (Stop)
  commitea al terminar la sesión.

*(Ya cableados: ver `.claude/hooks/` y su registro en `.claude/settings.json`. Los hooks usan ruta
absoluta `$CLAUDE_PROJECT_DIR` para resolver da igual el cwd; `bin/check` §6a/§6d lo verifica.)*
