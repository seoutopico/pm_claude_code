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

## Instalación

> **Recomendado:** instala `pm` por proyecto, no globalmente. Así cada vault de proyectos solo carga el plugin cuando trabajas en él, sin contaminar el resto de tus sesiones de Claude Code.

**1. Crea/entra a la carpeta donde quieres tu vault de proyectos:**

```bash
mkdir mi-vault
cd mi-vault
claude
```

**2. Dentro de la sesión, añade el marketplace e instala con scope project:**

```
/plugin marketplace add seoutopico/pm_claude_code
/plugin install pm@pm-marketplace --scope project
/reload-plugins
```

Esto crea `mi-vault/.claude/settings.json` con la declaración del plugin. **Solo está activo cuando arrancas Claude Code en `mi-vault/` o subcarpetas.**

Verifica con `/plugin` → pestaña Installed → debe aparecer `pm`. Empieza a teclear `/pm` y verás los 8 comandos.

### Instalación global (no recomendada)

Si quieres que `pm` esté activo en TODAS tus sesiones de Claude Code:

```
/plugin install pm@pm-marketplace
```

(sin `--scope project`). Útil si lo usas en muchos vaults distintos. Recuerda hacer `/reload-plugins` después.

## Quick start

Dentro de la sesión del vault, ejecuta:

```
/pm:init           # wizard interactivo
/pm:nuevo-proyecto # crea tu primer proyecto
# escribe notas en _inbox.md
/pm:procesar       # distribúyelas
/pm:reporte        # genera el reporte
```

## Integración con Obsidian

El wizard `/pm:init` te pregunta si quieres configurar Obsidian en el vault. Si dices que sí:

- Se crea `.obsidian/` con `showUnsupportedFiles: true` (Obsidian muestra TODOS los tipos de archivo, no solo `.md`).
- Se instala el plugin de comunidad [`show-hidden-files`](https://github.com/polyipseity/obsidian-show-hidden-files) (incluido en este plugin con autorización de su licencia MIT), que hace visibles las carpetas que empiezan por `.` como `.pm/`, `.claude/`, `.obsidian/`.

Resultado: puedes abrir el vault con Obsidian y desde el editor visual ver/editar:

- Tus proyectos (README, reuniones, decisiones) en preview Markdown bonito.
- Tu `.pm/config.json` (cambiar idioma, paths, taxonomías, módulos activos).
- Tus overrides personales en `.pm/agents/`, `.pm/skills/`, `.pm/commands/` (si los tienes).
- Los hooks de validación que actives en `.pm/validation/`.
- Todo lo demás del vault.

No es obligatorio usar Obsidian; el plugin funciona igual con VS Code o cualquier editor de texto. Pero la integración está hecha para que el flujo sea cómodo si Obsidian es tu editor principal.

## Desarrollo local del plugin

Si quieres iterar sobre el código del plugin (no usarlo, sino modificarlo):

```bash
claude --plugin-dir "ruta/local/al/clone"
```

## Requisitos

- Claude Code v2.0 o superior
- Node.js v16+ (para los scripts del wizard y sync)
- En Unix para el módulo Sync: `rsync` instalado
- (Opcional) Obsidian si quieres usar la integración del editor visual

## Autoría

Plugin creado por **Aina-Lluna Taylor** (Head of GenAI, Editorial Planeta).

- 🌐 Web: [ainalluna.com](https://ainalluna.com)
- 📬 Newsletter: [ainalluna.substack.com](https://ainalluna.substack.com/)
- 🐙 GitHub: [seoutopico](https://github.com/seoutopico)

El plugin Obsidian incluido `show-hidden-files` es obra de [polyipseity](https://github.com/polyipseity), redistribuido bajo su licencia MIT.

## Licencia

MIT — ver [LICENSE](./LICENSE).
