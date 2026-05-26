---
name: procesar
description: Procesa el inbox del vault y distribuye cada nota al proyecto correcto. Las notas que no matcheen ningún proyecto quedan en "sin clasificar" y se muestran al usuario.
context: fork
agent: general-purpose
disable-model-invocation: true
---

# Procesar inbox

Eres el orquestador del procesamiento de inbox. Coordinas tres subagentes (`inbox-classifier`, `project-updater`, `view-syncer`) para vaciar `_inbox.md` distribuyendo cada nota al README correcto y actualizar las vistas derivadas.

## Precondiciones

- Debe existir `.pm/config.json` (creado por `/pm:init`). Si no, dile al usuario que ejecute `/pm:init` primero y termina.

## Flujo de ejecución

### Paso 1 — Clasificar

Lanza el subagente **`inbox-classifier`** con la instrucción:

> Lee `.pm/config.json` para resolver `paths.inbox` y `paths.registry`. Lee el inbox y el registry. Clasifica cada nota y devuelve el JSON estructurado con `buckets.project_updates[]` y `buckets.uncategorized[]`.

Espera el resultado. Parsea el JSON.

### Paso 2 — Distribuir en paralelo

Lanza en paralelo (sin esperar uno por uno; espera a que todos terminen antes del paso 3):

- Para CADA entrada de `buckets.project_updates[]`: un subagente **`project-updater`** con `project_id`, `project_path` y `notas`.
- Para CADA entrada de `buckets.communications[]` (si existe): un subagente **`communication-archiver`** con el `body`, `recipients_raw` y `subject_suggested`.
- Para CADA entrada de `buckets.processes[]` (si existe): un subagente **`process-archiver`** con el `text`, `name_suggested` y `category_suggested`.

Si el classifier devolvió `communications[]` pero `features.communications` es `false`, traslada esas entradas a `uncategorized` con prefijo `[comunicación no archivada]`. Mismo trato para `processes[]` si `features.processes` es `false`.

### Paso 3 — Sincronizar vistas

Lanza el subagente **`view-syncer`** para regenerar `STATUS.md` y el registry.

### Paso 4 — Vaciar inbox

Reemplaza el contenido del archivo apuntado por `paths.inbox` con la plantilla mínima:

```markdown
# Inbox

<!-- Escribe aquí notas libres. Ejecuta /pm:procesar para distribuirlas. -->
```

### Paso 5 — Reportar al usuario

Muestra un resumen breve:

- Proyectos actualizados (lista con `project_id`)
- Notas que quedaron sin clasificar (en bloque ``` para que el usuario decida qué hacer)
- Tiempo total (si lo puedes medir)
- Si algún `project-updater` falló porque el README no existía: lista los `project_id` afectados y sugiere `/pm:nuevo-proyecto`

## Reglas

- Si el inbox está vacío, no lances nada y di al usuario "Inbox vacío. Nada que procesar."
- Si todas las notas quedan en `uncategorized`, no lances `project-updater` ni `view-syncer`. Solo muestra las notas al usuario.
- NO modifiques la estructura de los READMEs (cabeceras, frontmatter); eso es responsabilidad de `project-updater`.
- Idioma de los mensajes al usuario: según `config.language`. Si `language_strict: true`, respeta acentos.
- Si el usuario ha activado los módulos `communications` y/o `processes` en su config y el inbox contiene un bloque que claramente es un mail (cabecera tipo "Para:" o "Enviado a:") o un proceso ("el proceso para X es...", "los pasos son..."), invoca también los subagentes `communication-archiver` o `process-archiver` en paralelo con los `project-updater`. Si los módulos no están activos, esas notas van a `uncategorized`.
