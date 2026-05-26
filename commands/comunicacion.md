---
description: Archiva una comunicación (mail, mensaje, anuncio) en el vault con metadatos inferidos. Lanza el subagente communication-archiver directamente.
---

Lanza el subagente **`communication-archiver`** pasándole el contenido del mensaje que el usuario incluya en el comando.

El usuario puede invocar así:

```
/pm:comunicacion

Para: cliente@example.com, equipo@example.com
Asunto: Actualización del proyecto X

Hola,

Os escribo para...
```

El subagente:
1. Lee `.pm/config.json` para resolver paths y taxonomías.
2. Extrae metadatos (fecha, asunto, tipo, audiencia, destinatarios, canal, links).
3. Genera slug + path `{communications_root}/{YYYY}/{YYYY-MM-DD}_{slug}.md`.
4. Escribe el archivo con frontmatter completo y cuerpo literal.
5. Actualiza el índice de `{communications_root}/README.md`.
6. Reporta al usuario el path creado y campos pendientes (`?`).

**Precondición:** `config.features.communications` debe ser `true`. Si no lo es, indica al usuario que active el módulo con: editar `.pm/config.json` y poner `"communications": true` en `features`, o ejecutar `/pm:init --force` y activar el módulo.
