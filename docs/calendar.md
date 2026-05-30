# Google Calendar en el sistema (rama v3)

> Cómo traer Google Calendar al sistema **sin perder su filosofía**: el calendario entra como
> **texto plano versionado** (`_memory/calendar.md`), procesado por el arnés (cola → líder →
> worker → revisor → Default-FAIL), no como un canal lateral vivo.

## La idea en una frase

El calendario se trata **igual que el inbox**: una fuente externa que se **materializa a texto** y
se procesa por el arnés. El repo sigue siendo la fuente de verdad; el calendario es un *feed* que
espejamos, no algo que el orquestador consulta a pelo.

## Las dos garantías (deterministas, las hace cumplir `bin/check` §7)

1. **Solo lectura.** El único agente que toca el conector es el worker `agenda-syncer`, y su
   frontmatter **no incluye** herramientas de escritura de calendario (`create_event`,
   `update_event`, `delete_event`, `respond_to_event`). `bin/check` falla si alguien se las añade.
   El sistema no puede tocar tu agenda por este camino.
2. **Dato, no instrucción.** El contenido de los eventos (que puede traer *prompt-injection* desde
   invitaciones externas) entra como texto a un worker acotado cuyo único trabajo es
   transcribir → escribir `calendar.md`. No llega como orden al líder.

## Piezas

| Pieza | Qué es |
|---|---|
| `.mcp.json` | Declara el conector MCP de Google Calendar (pinneado en el repo → viaja con el clon). |
| `.claude/agents/agenda-syncer.md` | Worker Haiku, **solo lectura**, que espeja el calendario. |
| `.claude/skills/agenda/SKILL.md` | Playbook que ejecuta el líder. |
| `.claude/commands/agenda.md` | Disparador manual `/agenda`. |
| `_memory/calendar.md` | El espejo en texto plano. **Derivado**, se regenera. |
| `bin/check` §7 | Verifica el invariante read-only + que el espejo existe. |

## Cómo dar de alta el conector

Hay dos transportes; el flujo del arnés es **idéntico** con cualquiera de los dos.

### Opción A — MCP remoto oficial de Google (recomendada: se versiona en el repo)

Ya está declarado en `.mcp.json`:

```json
{ "mcpServers": { "calendar": { "type": "http", "url": "https://calendarmcp.googleapis.com/mcp/v1" } } }
```

1. Crea credenciales OAuth en Google Cloud Console (tipo "Web application", con el redirect que
   pida tu cliente). **Los secretos NO van al repo** — van a `.claude/settings.local.json`
   (gitignored) o a variables de entorno. Regla de `CLAUDE.md`: cero credenciales en el repo.
2. En Claude Code, autentica el servidor: `/mcp` → `calendar` → *Authenticate*. Concede **solo los
   scopes de lectura** (`calendar.calendarlist.readonly`, `calendar.events.readonly`,
   `calendar.events.freebusy`).
3. Comprueba que aparecen las tools `mcp__calendar__list_calendars`, `…__list_events`,
   `…__get_event`. Son las que `agenda-syncer` tiene permitidas.

### Opción B — Connector nativo de claude.ai (cero config, no portable)

Si ya tienes el connector de Google Calendar añadido en claude.ai, desde **Claude Code v2.1.46**
(feb 2026) está disponible solo, como `mcp__claude_ai_Google_Calendar__*`. No necesitas `.mcp.json`.
Contrapartida: la config vive en tu cuenta, no en el repo, así que **no viaja con el clon**. Si usas
esta vía, ajusta el `tools:` de `agenda-syncer.md` a los nombres `mcp__claude_ai_Google_Calendar__*`
de lectura (vía `arquitecto` / `/extender`, para que quede con su check).

## Uso

```
/agenda                 → espeja los próximos 30 días a _memory/calendar.md
/agenda esta semana     → ventana acotada
```

El líder lanza `agenda-syncer`, que reconstruye `_memory/calendar.md`, vincula eventos a proyectos
del registry cuando está claro, registra en `_memory/log.md` y, si cambian hitos activos, refresca
STATUS.

## Lo que este camino NO hace

- **No escribe en tu Google Calendar.** Crear/editar/borrar eventos es la dirección inversa, no está
  activada, y si algún día se quiere irá detrás de un control explícito del operador (patrón
  `_control/`), añadida por el `arquitecto` con su propio check — nunca dentro de `agenda-syncer`.
- **No consulta el calendario en vivo** desde el líder. Todo pasa por el espejo de texto.
