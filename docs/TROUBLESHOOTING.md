# Troubleshooting

Errores típicos y cómo resolverlos.

## Instalación

### El plugin no aparece tras `/plugin install`

1. Verifica que el marketplace está añadido: `/plugin marketplace list` debe mostrar `pm-marketplace`.
2. Reinicia la sesión de Claude Code (`/exit` y vuelve a entrar).
3. Comprueba `/plugin` en la pestaña Installed.
4. Si sigue sin aparecer, ejecuta `/reload-plugins`.

### `/plugin marketplace add` falla con "git: command not found"

Necesitas git instalado para que Claude Code clone el repo del marketplace.
- Windows: [Git for Windows](https://git-scm.com/download/win)
- macOS: `brew install git` o `xcode-select --install`
- Linux: `apt install git` / `dnf install git`

## `/pm:init`

### "node: command not found" o "Node.js is required"

El wizard está en Node. Instala Node.js v16+:
- Descarga desde [nodejs.org](https://nodejs.org/) (versión LTS)
- Verifica con `node --version`

### "Ya existe .pm/config.json. Aborta para no sobreescribir"

Tu vault ya está inicializado. Si quieres reinicializar y perder la config previa, ejecuta:

```
/pm:init --force
```

Esto sobrescribe `.pm/config.json` pero **no toca** tus proyectos ni reportes existentes (solo el config + plantillas + inbox/status si están vacíos).

### El wizard no responde a mis inputs

Si lanzas el wizard desde un terminal sin TTY (CI, bash sandbox), readline no funciona. Usa el modo no interactivo con un archivo de respuestas:

```bash
node "<plugin>/scripts/init.js" --answers answers.json
```

Estructura de `answers.json`:

```json
{
  "owner_name": "Tu Nombre",
  "language": "es",
  "structure": "numerada",
  "cadence": "weekly",
  "project_status": "Explorando,Haciendo,Cerrado",
  "project_priority": "Alta,Media,Baja",
  "project_states_active": "Explorando,Haciendo",
  "enable_communications": true,
  "enable_processes": true,
  "enable_meetings": true,
  "enable_sync": false,
  "sync_destination": "",
  "install_demo": true
}
```

## `/pm:procesar`

### "Inbox vacío. Nada que procesar"

`_inbox.md` solo tiene la cabecera y el comentario inicial. Escribe alguna nota debajo del comentario y vuelve a lanzar.

### "Todas las notas quedaron en uncategorized"

El `inbox-classifier` no encontró match entre el texto de las notas y las `keywords[]` de los proyectos en `_config/projects.json`. Soluciones:
1. Edita los proyectos del registry y añade keywords más amplias.
2. O crea un proyecto nuevo cuyo nombre/keywords matcheen lo que escribes.
3. O escribe la nota empezando con el nombre exacto del proyecto.

### El subagente actualizó mal un README

`project-updater` se equivoca a veces si la nota es ambigua. Es seguro porque:
- Solo edita dentro de secciones existentes
- Siempre añade entrada al `Histórico`
- No cambia el frontmatter excepto `last_updated`

Si quieres deshacer, usa git: `git diff <path-readme>` y luego `git checkout <path-readme>` si la edición es indeseada. **Versiona tu vault con git** (recomendación universal).

### "Proyecto X mencionado en notas pero no existe README"

El classifier asignó una nota a un proyecto que está en `projects.json` pero cuya carpeta/README no existe. Soluciones:
- Crea el proyecto: `/pm:nuevo-proyecto` con el id mencionado.
- O quita la entrada del registry.

## `/pm:reporte`

### "Reporte no configurado"

`config.report` no existe o `config.features.periodic_report` es `false`. Edita `.pm/config.json`:

```json
{
  "features": { "periodic_report": true },
  "report": {
    "cadence": "weekly",
    "output_pattern": "{reports_root}/Semanales/semana_{N}_{ISO_DATE}.md",
    "history_file": "_data/historico_porcentajes.json",
    "rules_skill": "reporte-periodico-rules",
    "history_track_field": "progreso"
  }
}
```

### Δ del reporte siempre dice "—"

Es la primera vez que se ejecuta el reporte, no hay histórico anterior. A partir de la segunda ejecución verás `+5`, `-3`, `=`, `nuevo`.

### Re-ejecutar el reporte del mismo período duplica entradas en el histórico

No debería: `report-writer` sobrescribe la entrada del período actual si ya existe. Si ves duplicados, abre `_data/historico_porcentajes.json` y elimina manualmente la entrada duplicada (mantén la más reciente).

## `/pm:sync`

### "rsync: command not found" (macOS/Linux)

Instala rsync:
- macOS: `brew install rsync` (suele venir preinstalado)
- Linux: `apt install rsync` o `dnf install rsync`

### "El destino no existe"

`config.sync.destination` apunta a una ruta inexistente. El script intenta crearla la primera vez. Si falla:
- Comprueba que tienes permisos de escritura en la carpeta padre.
- Si el destino es OneDrive/Dropbox, asegúrate de que el cliente está corriendo y la carpeta sincronizada en local.

### El sync borra archivos en el destino

`robocopy /MIR` y `rsync --delete` son **mirror**: lo que no está en origen se borra en destino. **Nunca edites archivos directamente en el destino del sync** — usa el vault como única fuente de verdad. Si necesitas que el destino sea solo-añadir, modifica `scripts/sync.js` quitando `/MIR` y `--delete` (te toca forkear o pedir un override).

## Hooks

### Los hooks no se ejecutan

Los hooks del plugin se declaran en `<plugin>/hooks/hooks.json`. Para que Claude Code los cargue, **deben estar declarados también en el `settings.json` del usuario** (o del proyecto). Esto NO lo hace el plugin automáticamente.

Para activarlos copia el contenido de `<plugin>/hooks/hooks.json` a tu `.claude/settings.json` (o pídeselo a Claude: "lee `<plugin>/hooks/hooks.json` y añade las declaraciones a mi `.claude/settings.json`").

### "node: command not found" en un hook

Los hooks están en Node. Verifica `node --version` desde el mismo entorno que Claude Code usa.

## Otros

### Quiero deshacer una actualización masiva

Si tu vault está versionado con git (recomendado): `git diff` para ver, `git checkout .` para descartar, o `git reset --hard HEAD` para volver al último commit. Si no está versionado: no hay deshacer. Versiona desde día 1.

### El plugin se actualizó en GitHub y mis cambios locales se perdieron

Si editaste archivos dentro del plugin (no del vault), al hacer `/plugin install pm@pm-marketplace` se sobrescriben. Para personalizaciones que sobrevivan a actualizaciones, usa el mecanismo de override del vault: `.pm/agents/`, `.pm/skills/`, `.pm/commands/` (ver `CUSTOMIZATION.md` sección "Extender el plugin").

### Quiero migrar a un nuevo ordenador

Copia o sincroniza la carpeta del vault entera (incluyendo `.pm/`). El plugin se instala aparte vía marketplace. No hay nada local del plugin que necesites llevarte.

## ¿Algo no está aquí?

Abre un issue en https://github.com/seoutopico/pm_claude_code/issues con:
1. Comando que ejecutaste
2. Output completo (incluido cualquier error)
3. Tu `.pm/config.json` (puedes ocultar email/owner si quieres)
4. Versión de Claude Code (`claude --version`) y Node (`node --version`)
