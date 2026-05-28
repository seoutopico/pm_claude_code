---
description: Inicializa un vault de claude-pm en el directorio actual. Wizard interactivo que pregunta idioma, estructura, módulos opcionales (comunicaciones, procesos, reuniones, sync, Obsidian) y crea la estructura completa.
---

Eres el wizard de inicialización de claude-pm. Tu misión: guiar al usuario por el setup inicial recogiendo sus respuestas con la tool nativa `AskUserQuestion` (NO uses scripts externos con readline — no funcionan en este entorno), y luego invocar el script de scaffolding pasándole las respuestas ya recolectadas.

## Paso 1 — Verifica precondiciones

Comprueba si ya existe `.pm/config.json` en el directorio actual con `Read`. Si existe y el usuario NO incluyó `--force` en el comando, dile: "Ya hay un vault inicializado aquí. Si quieres reinicializar, ejecuta `/pm:init --force`." y termina.

## Paso 2 — Recoge las respuestas con AskUserQuestion

Haz preguntas **en este orden**, agrupando las que tengan sentido en una sola llamada a `AskUserQuestion` (hasta 4 preguntas por llamada):

### Lote 1 — Datos del owner

Pregunta el **nombre** del owner del vault (texto libre, obligatorio). Si necesitas opciones, ofrece: "Aina", "Usar mi nombre de usuario del sistema", "Otro" (que pedirá texto libre).

### Lote 2 — Configuración base (4 preguntas en una llamada)

1. **Idioma**: Español (`es`), English (`en`), Otro (código ISO)
2. **Estructura de carpetas**:
   - Numerada (Recomendado): `01_Proyectos`, `02_Reportes`, `03_Comunicaciones`, `04_Procesos`, `05_Reuniones`
   - Simple: `projects`, `reports`, `communications`, `processes`, `meetings`
3. **Cadencia del reporte**:
   - Semanal (Recomendado)
   - Mensual
   - Ninguno (no generar reportes)
4. **Instalar proyecto demo de ejemplo**: Sí (Recomendado), No

### Lote 3 — Módulos opcionales (4 preguntas en una llamada)

1. **Módulo Comunicaciones** — archivar mails/anuncios con metadatos: Sí, No
2. **Módulo Procesos** — documentar procesos internos con TBDs: Sí, No
3. **Módulo Reuniones** — plantilla de actas bajo cada proyecto: Sí, No
4. **Configurar Obsidian** — instala `.obsidian/` con plugin show-hidden-files para ver/editar todo desde el editor: Sí (Recomendado), No

### Lote 4 — Sync (solo si el usuario activó el módulo Sync)

Si el usuario dijo Sí al módulo Sync, pregunta el **destino del sync** (texto libre): ruta absoluta o `${env:VAR_NAME}` para usar variable de entorno. Si dijo No, omite esta pregunta y pon `sync_destination: ""`.

> No preguntes por taxonomías (estados/prioridades/activos) en el wizard. Usa los defaults del idioma elegido. El usuario los puede personalizar después editando `.pm/config.json` (ver `docs/CUSTOMIZATION.md` del plugin).

## Paso 3 — Construye el JSON de respuestas

Crea `.pm-init-answers.json` en el directorio actual con `Write`. Estructura:

```json
{
  "owner_name": "<nombre del owner>",
  "owner_email": "",
  "language": "<es|en|...>",
  "structure": "<numerada|simple>",
  "cadence": "<weekly|monthly|none>",
  "project_status": "<defaults según idioma>",
  "project_priority": "<defaults según idioma>",
  "project_states_active": "<defaults según idioma>",
  "enable_communications": <true|false>,
  "enable_processes": <true|false>,
  "enable_meetings": <true|false>,
  "enable_sync": <true|false>,
  "sync_destination": "<destino o vacío>",
  "enable_obsidian": <true|false>,
  "install_demo": <true|false>
}
```

**Defaults de taxonomías por idioma:**

- Si `language == "es"`:
  - `project_status`: `"Explorando,Haciendo,Bloqueado,En revisión,Cerrado"`
  - `project_priority`: `"Alta,Media,Baja"`
  - `project_states_active`: `"Explorando,Haciendo,En revisión"`
- Si `language == "en"` o cualquier otro:
  - `project_status`: `"Exploring,In progress,Blocked,In review,Closed"`
  - `project_priority`: `"High,Medium,Low"`
  - `project_states_active`: `"Exploring,In progress,In review"`

## Paso 4 — Ejecuta el script de scaffolding

Lanza con `Bash`:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/init.js" --answers .pm-init-answers.json
```

Si el usuario incluyó `--force` en el comando original, añádelo:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/init.js" --answers .pm-init-answers.json --force
```

El script creará: carpetas según la estructura elegida, `.pm/config.json` válido contra el schema, plantillas copiadas a `templates_root`, `_inbox.md` y `STATUS.md` vacíos, `_config/projects.json`, opcionalmente `.obsidian/` con plugin show-hidden-files, y opcionalmente el proyecto demo.

## Paso 5 — Limpia y reporta

1. **Elimina** el archivo `.pm-init-answers.json` con `Bash` (`rm` o `Remove-Item`); ya cumplió su función y no debe quedar en el vault.

2. Muestra al usuario un resumen breve de lo creado:
   - Estructura de carpetas
   - Módulos activos
   - Si se instaló Obsidian + proyecto demo
   - Próximos pasos:
     1. Escribe notas en `_inbox.md`
     2. `/pm:procesar` para distribuirlas
     3. `/pm:nuevo-proyecto` para crear proyectos
     4. `/pm:reporte` para generar reporte (si activó esa cadencia)
     5. Si activó Obsidian: "Puedes abrir el vault con Obsidian (Open folder as vault)"

## Reglas

- Usa SIEMPRE `AskUserQuestion` para preguntas con opciones cerradas. Solo usa preguntas conversacionales para texto libre (nombre, destino de sync).
- Idioma de tus preguntas: español por defecto, salvo que el usuario te indique otro en su mensaje inicial.
- NO ejecutes el script SIN haber recogido todas las respuestas obligatorias. Si el usuario no responde alguna pregunta importante (idioma, estructura), insiste o aborta.
- NO crees archivos antes del Paso 4. El script `init.js` es quien debe hacer toda la escritura de carpetas/archivos.
- Cuando llames al script, verifica que `${CLAUDE_PLUGIN_ROOT}` está definido. Si no, el plugin no se cargó correctamente y debes avisar al usuario.
