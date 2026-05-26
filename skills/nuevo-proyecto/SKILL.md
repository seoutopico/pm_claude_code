---
name: nuevo-proyecto
description: Crea un proyecto nuevo (carpeta + README desde plantilla + entrada en registry + fila en STATUS). Skill autocontenida (no usa subagentes).
disable-model-invocation: true
---

# Nuevo proyecto

Crea la estructura completa de un proyecto nuevo en el vault. Esta skill es autocontenida: no lanza subagentes; ejecuta los pasos directamente.

## Precondiciones

- Debe existir `.pm/config.json`. Si no, pide al usuario que ejecute `/pm:init`.

## Paso 1 — Leer configuración

Lee `.pm/config.json`. Necesitas: `paths.projects_root`, `paths.registry`, `paths.templates_root`, `taxonomies.project_status`, `taxonomies.project_priority`, `language`.

## Paso 2 — Recoger datos del usuario

Pregunta interactivamente (en el idioma de `config.language`, con valores por defecto razonables):

1. **id** del proyecto (kebab-case, ej. `mi-proyecto`). Valida que matchee `^[a-z0-9]+(-[a-z0-9]+)*$`.
2. **name** (nombre legible, ej. "Mi Proyecto").
3. **status** (elige de `taxonomies.project_status[]`). Por defecto: el segundo de la lista (suele ser "en marcha").
4. **priority** (elige de `taxonomies.project_priority[]`). Por defecto: el segundo (suele ser "media").
5. **keywords** (separadas por coma). Mínimo 1. Estas son las que `inbox-classifier` usará para asignar notas a este proyecto.
6. **owner** (opcional). Por defecto: `owner.name` del config.
7. **descripcion_una_linea** (opcional). Si vacía, se deja el placeholder.

## Paso 3 — Validar unicidad

Lee el registry actual (`paths.registry`). Si ya existe un proyecto con el mismo `id`, **aborta** con mensaje claro: "Ya existe un proyecto con id `{id}`. Elige otro o usa `/pm:procesar` para añadir notas al existente."

Comprueba también que no existe la carpeta `{paths.projects_root}/{id}/`. Si existe pero no está en el registry, avisa al usuario y pide confirmación antes de sobreescribir.

## Paso 4 — Crear estructura de carpetas

```
{paths.projects_root}/{id}/
{paths.projects_root}/{id}/reuniones/
{paths.projects_root}/{id}/documentos/
```

## Paso 5 — Generar README desde plantilla

Lee `{paths.templates_root}/TPL_proyecto.md`. Sustituye los placeholders `{{var}}`:

- `{{id}}` → el id
- `{{name}}` → el nombre
- `{{status}}` → estado elegido
- `{{priority}}` → prioridad elegida
- `{{keywords}}` → keywords como CSV
- `{{owner}}` → owner
- `{{today}}` → fecha ISO de hoy
- `{{descripcion_una_linea}}` → la descripción o, si vacía, déjala como placeholder

Escribe el resultado en `{paths.projects_root}/{id}/README.md`.

## Paso 6 — Añadir entrada al registry

Lee el registry. Añade al array `projects[]`:

```json
{
  "id": "<id>",
  "name": "<name>",
  "path": "<paths.projects_root>/<id>",
  "status": "<status>",
  "priority": "<priority>",
  "progreso": 0,
  "keywords": ["<keyword1>", "<keyword2>", ...],
  "owner": "<owner>",
  "archived": false,
  "created": "<today>",
  "last_updated": "<today>",
  "metadata": {}
}
```

Actualiza `registry.last_updated` al día de hoy. Reescribe con indentación 2 espacios.

## Paso 7 — Confirmar al usuario

Muestra:

- Path del proyecto creado
- Path del README
- Aviso de que se ha añadido al registry
- Sugerencia: "Para que el reporte semanal capture su avance desde el inicio, considera ejecutar `/pm:sync-view`."

## Reglas

- NO inventes datos que el usuario no haya dado.
- NO añadas el proyecto al `_data/historico_porcentajes.json` (se hace al primer reporte automáticamente con valor 0 o el actual).
- Idioma según `config.language`.
- Si el usuario aborta a mitad (envía un valor vacío en un campo obligatorio), pregunta de nuevo. No asumas.
