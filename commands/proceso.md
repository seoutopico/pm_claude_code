---
description: Documenta un proceso interno (cobros, RRHH, legal, IT, etc.) en el vault. Crea nuevo o actualiza existente (integra pasos, cierra TBDs). Lanza el subagente process-archiver directamente.
---

Lanza el subagente **`process-archiver`** pasándole el texto del proceso que el usuario incluya en el comando.

Ejemplo de invocación:

```
/pm:proceso

El proceso para que un proveedor externo cobre es:
1. Me tienen que enviar factura con datos fiscales X, Y, Z
2. La paso a finanzas (María) por mail
3. Finanzas paga a 30 días
```

El subagente:
1. Lee `.pm/config.json` para resolver paths y taxonomías de procesos.
2. Detecta si el proceso ya existe (por slug fuzzy match).
3. Si nuevo: crea `{processes_root}/{slug}.md` con frontmatter, secciones rellenadas, TBDs marcados.
4. Si existe: integra la información nueva, cierra TBDs, actualiza histórico.
5. Actualiza el índice de `{processes_root}/README.md`.
6. Reporta al usuario: creado/actualizado, path, estado, TBDs pendientes.

**Precondición:** `config.features.processes` debe ser `true`.
