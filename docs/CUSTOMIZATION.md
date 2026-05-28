# Personalización

Toda la configuración del plugin vive en **`.pm/config.json`** del vault. Edítalo a mano y los agentes leerán los cambios la próxima vez que se invoquen.

## Cambiar idioma

```json
{
  "language": "es",          // ISO 639-1: es, en, fr, de, pt, ca, ...
  "language_strict": true    // exige diacríticos correctos del idioma
}
```

Afecta a los textos que los agentes generen (mensajes, secciones de READMEs, reportes). No traduce el contenido existente.

## Cambiar nombres de carpetas

```json
{
  "paths": {
    "projects_root": "01_Proyectos",
    "reports_root": "02_Reportes",
    "communications_root": "03_Comunicaciones",
    "processes_root": "04_Procesos",
    "meetings_root": "05_Reuniones",
    "templates_root": "_plantillas",
    "config_root": "_config",
    "data_root": "_data",
    "inbox": "_inbox.md",
    "status": "STATUS.md",
    "registry": "_config/projects.json"
  }
}
```

Si renombras una carpeta, **mueve también el contenido manualmente** (el plugin no migra contenido cuando cambias paths).

## Cambiar taxonomías

Estas son listas cerradas que los agentes validan. Si añades un estado nuevo, automáticamente se reconoce.

```json
{
  "taxonomies": {
    "project_status": ["Explorando", "Haciendo", "Bloqueado", "En revisión", "Cerrado"],
    "project_priority": ["Alta", "Media", "Baja"],
    "project_states_active": ["Explorando", "Haciendo", "En revisión"],

    "communication_types": ["update", "announcement", "request", "report", "decision", "other"],
    "communication_channels": ["email", "slack", "teams", "meeting", "newsletter", "other"],

    "process_categories": ["finance", "hr", "legal", "it", "training", "governance", "communication", "other"],
    "process_states": ["draft", "partial", "complete"]
  }
}
```

`project_states_active` controla qué proyectos aparecen en `STATUS.md` y en el reporte. Si un proyecto tiene estado fuera de esa lista (ej. "Cerrado"), seguirá en el registry pero no en la tabla visible.

## Activar/desactivar módulos

```json
{
  "features": {
    "inbox_processing": true,     // /pm:procesar
    "project_scaffolding": true,  // /pm:nuevo-proyecto
    "view_sync": true,            // /pm:sync-view
    "periodic_report": true,      // /pm:reporte
    "report_validation": false,   // hook validate-report.js (ver abajo)

    "communications": true,       // /pm:comunicacion + communication-archiver
    "processes": true,            // /pm:proceso + process-archiver
    "meetings": true,             // plantillas para actas
    "sync": false                 // /pm:sync + script sync.js
  }
}
```

Si desactivas un módulo, su comando seguirá visible pero te avisará de que la feature está apagada.

## Configurar el módulo Sync

Para activar sync a OneDrive, Dropbox o cualquier path local:

```json
{
  "features": { "sync": true },
  "sync": {
    "enabled": true,
    "destination": "C:/Users/me/OneDrive/Mirror-PM",
    "sources": ["01_Proyectos", "02_Reportes", "STATUS.md"],
    "exclude_files": ["*.log", "*.tmp", ".DS_Store"],
    "exclude_dirs": ["__pycache__", ".venv", "node_modules", ".git", ".pm", ".obsidian", ".vscode"]
  }
}
```

- `destination`: ruta absoluta o variable de entorno tipo `${env:MIRROR_DEST}`.
- `sources`: rutas relativas al vault. Si omites el campo, sincroniza el vault entero excepto los `exclude_dirs`.
- Cross-platform: usa `robocopy` en Windows y `rsync` en Unix.

Lanza `/pm:sync --dry-run` antes de la primera sincronización real.

## Personalizar las reglas del reporte

Por defecto el reporte sigue las reglas neutras de la skill `reporte-periodico-rules` que viene con el plugin. Si quieres reglas más opinadas (audiencia concreta, palabras prohibidas, longitud máxima, datos fijos como cabecera/firma), tienes dos opciones:

### Opción A — Override en el vault (recomendada)

Crea `.pm/skills/reporte-periodico-rules/SKILL.md` con tus reglas. Frontmatter mínimo:

```yaml
---
name: reporte-periodico-rules
user-invocable: false
---
```

Y debajo escribe tus reglas (las que quieras: tono, secciones obligatorias, palabras prohibidas, estructura, datos fijos). El `report-writer` cargará tu versión en lugar de la del plugin. Sobrevive a actualizaciones del plugin.

### Opción B — Validación automática post-reporte

Crea `.pm/validation/report-rules.json`:

```json
{
  "forbidden_patterns": [
    { "name": "no_colors", "regex": "VERDE|AMBAR|ROJO|🟢|🟡|🔴", "flags": "i" },
    { "name": "no_budget", "regex": "presupuesto|budget|€", "flags": "i" }
  ],
  "required_patterns": [
    { "name": "has_cartera", "regex": "## Cartera", "flags": "" }
  ],
  "max_words": 800
}
```

Y activa el hook en config:

```json
{
  "validation": {
    "on_subagent_stop": ["report-writer"]
  }
}
```

El hook `validate-report.js` se ejecuta tras cada reporte. Si encuentra violaciones, el subagente las recibe y corrige antes de terminar.

## Hook de aviso al cerrar la sesión

Si quieres que Claude te avise al cerrar la sesión si dejaste notas sin procesar en el inbox:

```json
{
  "validation": {
    "on_inbox_processed": "check_empty"
  }
}
```

## Extender el plugin (avanzado)

Si quieres añadir tus propios agentes/skills/commands SIN forkear el plugin (útil para reglas muy específicas de tu organización), créalos en el vault bajo:

```
mi-pm/.pm/
├── agents/<mi-agente>.md
├── skills/<mi-skill>/SKILL.md
└── commands/<mi-comando>.md
```

Claude Code los cargará junto con los del plugin. Como ejemplo: si quieres tu propio archiver con reglas distintas, copia el contenido de `agents/communication-archiver.md` del plugin a `.pm/agents/mi-archiver.md` y modifícalo.

> Esta sección es para casos avanzados; **no necesitas crear nada tuyo para usar el plugin**.
