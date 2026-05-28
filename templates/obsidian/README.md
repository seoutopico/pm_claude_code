# Integración Obsidian para `pm`

Esta carpeta es una **plantilla de configuración Obsidian** que `/pm:init` copia al vault del usuario si activa la integración.

## Qué incluye

- **`app.json`**: activa `showUnsupportedFiles: true` para que Obsidian muestre TODOS los tipos de archivo (no solo `.md`). Útil para ver/editar `.json`, `.js`, `.sh`, etc.
- **`community-plugins.json`**: lista los plugins de comunidad activos (por defecto solo `show-hidden-files`).
- **`plugins/show-hidden-files/`**: copia del plugin Obsidian [show-hidden-files](https://github.com/polyipseity/obsidian-show-hidden-files) de polyipseity (MIT). Permite ver carpetas/archivos que empiezan por `.` (como `.claude/`, `.pm/`, `.obsidian/` misma).

## Por qué

El usuario que abre su vault con Obsidian puede:

1. Ver y editar los proyectos en `01_Proyectos/` con preview Markdown bonito.
2. Editar comunicaciones, procesos, reuniones, reportes en el mismo editor.
3. **Ver y editar su `.pm/config.json`** y los archivos del plugin (si tiene overrides en `.pm/agents/`, etc.) sin salir de Obsidian.
4. Ver archivos `.js`, `.json`, `.sh` de hooks/scripts si los tiene personalizados.

Todo lo que el plugin `pm` produce queda visible y editable desde un único editor visual.

## Atribución

El plugin `show-hidden-files` es obra de [polyipseity](https://github.com/polyipseity), licencia MIT. Se redistribuye en este template para conveniencia del usuario; el autor original mantiene el copyright.
