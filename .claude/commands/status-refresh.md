---
description: Regenera STATUS.md y _memory/_registry.json a partir de los READMEs de los proyectos.
disable-model-invocation: true
---

# /status-refresh

Invoca el agente `status-syncer`. Reescribe desde cero:

- `STATUS.md` — dashboard humano (tabla + atención + próximas fechas).
- `_memory/_registry.json` — versión estructurada para que otros agentes la consuman sin escanear todos los markdowns.

**Fuente de verdad**: los `_projects/*/README.md`. STATUS y registry son derivadas; si hay conflicto manda el README.

Añade entrada al log:
```
## [YYYY-MM-DD] status-refresh | N proyectos sincronizados
```

Idempotente: lanzarlo sin cambios produce los mismos archivos.

Útil tras:
- Crear o cerrar varios proyectos.
- Editar manualmente READMEs.
- `/lint` reportando desincronizaciones.
