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

Para CADA entrada de `buckets.project_updates[]`, lanza UN subagente **`project-updater`** en paralelo. A cada uno pasa:

- `project_id` y `project_path` (ambos vienen del classifier)
- el array de `notas` que le corresponden

Los subagentes son independientes; no esperes uno para lanzar el siguiente. Espera a que todos terminen antes del paso 3.

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
- Las extensions del usuario (subagentes propios en `.pm/agents/`) NO se invocan automáticamente desde esta skill. Si el usuario tiene un `comunicacion-archiver` propio o un `proceso-archiver` propio, debe crear su propia skill orquestadora copiando esta como referencia. El MVP solo orquesta los 3 subagentes core.
