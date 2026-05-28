---
description: Health check del sistema. Detecta contradicciones, huérfanos, gaps y referencias rotas.
---

# /lint

Invoca el skill `wiki-lint`. Es un health check inspirado en el `Lint` del LLM Wiki de Karpathy.

Recorre:
- `_memory/` (index, log, projects, people, decisions, _registry.json)
- `_projects/` (READMEs, reuniones, decisiones)
- `_inbox/`
- `STATUS.md`

Busca y reporta:

| Categoría | Ejemplo |
|---|---|
| **Contradicciones** | README dice "Cancelado" pero `projects.md` lo lista activo. |
| **Huérfanos** | Proyecto en `_projects/` sin entrada en `_memory/projects.md`. |
| **Gaps** | Proyecto "En curso" sin reuniones desde hace 30+ días. |
| **Estructura** | Carpeta de proyecto sin README. |
| **Memoria** | `log.md` sin entradas recientes a pesar de cambios en proyectos. |

**No corrige nada automáticamente.** Devuelve una tabla con severidad + acción sugerida (comando concreto o edición manual).

Añade al final una entrada al log:
```
## [YYYY-MM-DD] lint | N hallazgos (C: X, M: Y, B: Z)
```

Recomendación: lanzar `/lint` una vez por semana.
