# Cómo funciona la memoria

> Esta es la parte menos obvia del sistema. Léelo una vez y luego olvídate, funciona sola.

## El problema que resuelve

En una conversación normal con un LLM, todo el contexto se pierde al cerrar el chat. Si vuelves mañana, tienes que volver a explicar quién eres, qué proyectos tienes, qué decisiones tomaste. El LLM **redescubre tu contexto desde cero cada vez**.

Lo "lógico" sería darle todo el repositorio en cada sesión. Pero un PM serio acaba con miles de archivos. Mandarlos todos cada vez es caro en tokens, lento, y mata la utilidad del contexto activo.

## La idea (patrón Karpathy, LLM Wiki)

En vez de redescubrir, el LLM **mantiene activamente una memoria persistente** que crece contigo. Tres capas:

| Capa | Quién la toca | Qué contiene |
|---|---|---|
| **Fuentes brutas** | Tú las metes, el LLM solo lee | Notas sueltas en `_inbox/`, briefs en `_projects/<id>/docs/` |
| **Wiki** | El LLM escribe, tú lees | Todo `_memory/`: índice, log, proyectos, gente, decisiones |
| **Schema** | Tú editas | `CLAUDE.md` — las reglas de cómo se mantiene la wiki |

Karpathy lo explica [aquí en su gist original](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

## Las tres operaciones

### Ingest (entrada)

Tú dejas información cruda en `_inbox/_inbox.md` o en un brief de proyecto. Cuando lanzas `/ingesta`, el LLM lee, clasifica, integra en la wiki, **actualiza varios archivos en una sola pasada** (un proyecto + memoria + log) y vacía el inbox.

### Query (consulta)

Cuando preguntas algo al sistema, el LLM va a la wiki primero (`_memory/_registry.json` para info rápida, después markdowns relevantes), no a los archivos crudos. Las respuestas valiosas se pueden archivar como nueva página si tiene sentido (decisión, concepto transversal).

### Lint (limpieza)

Periódicamente (`/lint`), el LLM hace health check: contradicciones, páginas huérfanas, gaps, log desactualizado. **Solo reporta**, tú decides qué corregir.

## Los archivos rituales

### `_memory/index.md`

Catálogo navegable. Qué hay en el sistema, con enlaces. Lo mantiene `wiki-maintainer` cada vez que se añade o quita algo.

### `_memory/log.md`

Changelog **append-only**. Formato ritual: `## [YYYY-MM-DD] operación | título`. Es parseable con `grep` o `awk`. **Nunca se edita ni se borra**: si algo está mal, se añade una entrada nueva que rectifica.

### `_memory/projects.md`

Tabla compacta. Una línea por proyecto. Es la versión humana del registry.

### `_memory/people.md`

Stakeholders recurrentes. Una sección por persona. Cuando una nota del inbox actualiza datos de alguien conocido, esta sección crece.

### `_memory/decisions.md`

Decisiones transversales numeradas `D-NNN`. Nunca se renumera. Si una decisión queda obsoleta, otra la supersede (`D-NNN+k`).

### `_memory/_registry.json`

Versión JSON del `projects.md`. Para que **los agentes lean sin coste**: en vez de escanear 30 READMEs cada vez que necesitan contexto sobre proyectos, leen este JSON pequeño. **No lo edites a mano**: lo regenera `/status-refresh`.

## Por qué markdown y no SQLite o JSON pesado

- **Humano-legible**: lo editas con cualquier editor.
- **Versionable**: git muestra diffs útiles, no blobs binarios.
- **Universal**: `grep`, Obsidian, VS Code, tu LLM, cualquier herramienta lo entiende.
- **Sin dependencias**: no necesitas tener `sqlite3` o un módulo Python instalado.
- **Escala lo que un PM individual escala**: hasta 30-50 proyectos activos sin sudar.

El `_registry.json` es la única excepción y es **derivado**, no fuente.

## Por qué un `log.md` append-only

Porque un cambio sólo tiene sentido si conservas el antes. "El proyecto X ahora está cancelado" no informa lo mismo que "el proyecto X pasó de En curso a Cancelado el 2026-05-22 porque Legal rechazó la propuesta".

El log preserva **causalidad temporal**. Sin él, la memoria es una foto fija; con él, es una película.

## Privacidad

`_memory/` se versiona en git. Si compartes el repo, lo compartes todo. Para apuntes privados que no quieres en remoto:

- `_memory/people.local.md` → ya en `.gitignore`.
- Cualquier archivo `*.local.md` queda fuera del repo automáticamente (si añades el patrón al `.gitignore`).

## Resumen en una frase

**Tú curas las fuentes (inbox, briefs) y haces preguntas. El LLM mantiene índice, log, registry y referencias cruzadas. No al revés.**
