# Personalizar el sistema

Todo lo que controla a Claude vive en `.claude/`. Borras, editas, añades.

## Añadir un skill nuevo

Un skill es una capacidad reutilizable. Crea una carpeta dentro de `.claude/skills/` con un `SKILL.md` dentro:

```
.claude/skills/mi-skill/SKILL.md
```

Estructura del archivo:

```markdown
---
name: mi-skill
description: Frase corta. Cuándo se activa este skill. Qué trigger lo dispara.
---

# Skill: Mi skill

## Cuándo se activa
## Qué hace
## Cómo proceder
## Output esperado
## Reglas
```

La `description` del frontmatter es clave: es lo que Claude usa para decidir si invocar tu skill. Sé específico, menciona triggers concretos ("trigger con X", "cuando el usuario diga Y").

Ejemplos en `.claude/skills/ingesta/`, `.claude/skills/digest/`, etc.

## Añadir un agente nuevo

Un agente es un sub-LLM con un trabajo concreto. Crea un archivo dentro de `.claude/agents/`:

```
.claude/agents/mi-agente.md
```

Estructura:

```markdown
---
name: mi-agente
description: Lo que hace este agente. Cuándo se le llama.
tools: Read, Write, Edit, Grep   # opcional, restringe sus herramientas
---

Eres el {{rol concreto}}. Tu input es {{X}}, tu output es {{Y}}.

## Cómo proceder
## Reglas
```

Los agentes los llaman normalmente los skills cuando necesitan un trabajo encapsulado. También los puedes llamar directamente desde un prompt si quieres.

## Añadir un slash command

Un slash command es un atajo que dispara skills o instrucciones. Crea:

```
.claude/commands/mi-comando.md
```

Estructura:

```markdown
---
description: Lo que hace el comando.
argument-hint: <opcional, ej: nombre-de-algo>
---

# /mi-comando

Instrucciones para Claude sobre qué ejecutar cuando se lance este comando.
Normalmente invoca un skill por nombre y describe brevemente el flujo.
```

## Añadir un hook (opcional)

Los hooks son scripts que Claude Code ejecuta automáticamente en eventos (antes/después de tool use, al iniciar sesión, etc.). Se configuran en `.claude/settings.json`.

Por defecto, este repo **no incluye hooks** porque introducen complejidad cross-platform (bash en Linux/Mac, PowerShell en Windows). Si quieres añadirlos, mira la documentación oficial de Claude Code y añade scripts a `.claude/hooks/` referenciándolos en `settings.json`.

Hooks útiles que podrías querer:
- Validar que un README de proyecto tiene los campos mínimos antes de guardar.
- Recordarte ejecutar `/status-refresh` tras editar varios READMEs.
- Sincronizar `_memory/` con un Drive o repo remoto.

## Modificar lo que viene de fábrica

Todos los skills, agents, commands y plantillas son **archivos markdown que puedes editar a mano**. Si una plantilla te queda corta, añade secciones. Si un skill te pide cosas que no necesitas, simplifícalo.

**Lo único que no deberías cambiar sin pensar bien**:

- El formato ritual del log (`## [YYYY-MM-DD] operación | título`). Lo usan varios skills para parsear.
- Las rutas listadas en `CLAUDE.md` ("Rutas clave"). Si las mueves, actualiza también las referencias en los skills/agents.
- La estructura mínima de un proyecto (`README.md` + `meetings/` + `decisions/` + `docs/`). Otros skills la asumen.

## Integraciones externas

El repo es agnóstico de tu stack. Si quieres conectarlo con algo externo:

### Calendario / mail (Google, Outlook)
- Usa un MCP server (Gmail, Google Calendar) y añade un skill que lo invoque para extraer reuniones o mails y mandarlos al `_inbox`.

### Drive / OneDrive / Dropbox
- Configura tu sistema operativo para sincronizar la carpeta del repo. O añade un hook que ejecute `rsync` o `robocopy` tras cambios relevantes.
- Alternativa: `git push` a un remoto privado tras cambios. El repo es markdown puro, los diffs son legibles.

### Notion / Linear / Jira
- Añade un skill que lea cambios en tu sistema externo y los convierta a notas del inbox. Procesas con `/ingesta`. La memoria del sistema absorbe el contexto y tú no pierdes el control.

### Excel / Sheets / PowerPoint
- Para generar entregables (resúmenes ejecutivos, PowerPoint mensual), crea un skill específico que lea `_memory/` y construya el archivo. Mantén los scripts fuera del core, en una carpeta tuya como `_scripts/` (añadida al `.gitignore` si son privados).

## Versionar tu sistema

El repo es git. Trátalo como tal:

```bash
git add .
git commit -m "Añado proyecto X"
git push
```

Si compartes el repo, **revisa que no estés versionando datos sensibles** (información de personas reales, decisiones internas confidenciales). Usa `_memory/people.local.md`, `_projects/<id>/docs/*.local.md`, etc. para apuntes privados (añade el patrón al `.gitignore`).

## Si rompes algo

El repo es markdown. `git checkout` o `git reset` lo devuelven al estado anterior. No hay base de datos que recuperar.
