# Claude PM (`pm`)

> Toolkit completo de gestión de proyectos para [Claude Code](https://claude.com/claude-code). Sustituto ligero de Asana / Notion / Trello — orquestado por IA, persistido como Markdown en tu disco.

**Status:** 🚧 v0.2.0 pre-release. Funcional end-to-end pero pendiente de docs y publicación.

## Qué hace

`pm` convierte una carpeta de tu disco en un sistema de gestión de proyectos completo. Escribes notas libres en `_inbox.md`, ejecutas `/pm:procesar`, y Claude distribuye cada nota al proyecto correcto. Cada semana `/pm:reporte` genera un resumen del estado.

Activa los módulos que necesites; ignora el resto.

| Módulo | Comando | Qué hace |
|---|---|---|
| **Core (siempre activo)** | `/pm:init` | Inicializa el vault |
| Core | `/pm:nuevo-proyecto` | Crea un proyecto con README, registry, STATUS |
| Core | `/pm:procesar` | Procesa el inbox y distribuye notas a los proyectos |
| Core | `/pm:sync-view` | Regenera STATUS.md desde los READMEs |
| Core | `/pm:reporte` | Genera el reporte semanal o mensual |
| **Comunicaciones** (opcional) | `/pm:comunicacion` | Archiva un mail/anuncio con metadatos |
| **Procesos** (opcional) | `/pm:proceso` | Documenta un proceso interno con TBDs |
| **Sync** (opcional) | `/pm:sync` | Espeja el vault a OneDrive/Dropbox/path externo |

## Filosofía

- **El filesystem es la base de datos.** Sin backend, sin SQLite, sin cloud obligatorio.
- **Markdown es el formato.** Funciona con Obsidian, VS Code o cualquier editor.
- **Configura una vez, adapta el resto.** Todo vive en `.pm/config.json` del vault. Cambia idioma, nombres de carpetas, taxonomías o activa/desactiva módulos editando un solo archivo.
- **Out-of-the-box ready.** Instalas el plugin, ejecutas `/pm:init`, y ya tienes todo el sistema funcionando. No tienes que crear agentes ni skills tú mismo.

## Componentes incluidos

- **6 subagentes**: `inbox-classifier`, `project-updater`, `view-syncer`, `report-writer`, `communication-archiver`, `process-archiver`
- **4 skills orquestadoras**: `procesar`, `nuevo-proyecto`, `reporte-periodico`, `reporte-periodico-rules`
- **8 commands**: `/pm:init`, `/pm:procesar`, `/pm:nuevo-proyecto`, `/pm:reporte`, `/pm:sync-view`, `/pm:comunicacion`, `/pm:proceso`, `/pm:sync`
- **3 hooks opcionales** (opt-in vía config): `check-readme-edit`, `validate-report`, `check-inbox-empty`
- **5 plantillas**: proyecto, status, reporte, comunicación, proceso, reunión, decisión
- **Scripts cross-platform** en Node.js puro (Windows / macOS / Linux)
- **Schemas JSON validables** para `config.json` y `projects.json`

## Quick start

> Documentación completa: [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) (en construcción).

Mientras tanto, la opción más rápida para probarlo:

```bash
# Sesión de desarrollo apuntando directamente al plugin
claude --plugin-dir "ruta/local/al/plugin"
```

Luego en la sesión de Claude Code:

```
/pm:init           # responde al wizard
/pm:nuevo-proyecto # crea tu primer proyecto
# escribe notas en _inbox.md
/pm:procesar       # distribúyelas
/pm:reporte        # genera el reporte
```

## Diseño técnico

Ver [`../11_PLUGIN_DESIGN.md`](../11_PLUGIN_DESIGN.md) en el repo padre.

## Licencia

MIT — ver [LICENSE](./LICENSE) (TBD).
