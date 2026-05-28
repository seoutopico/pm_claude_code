# Índice del sistema

> Catálogo navegable de todo lo que existe en este sistema. Actualizado por el agente `wiki-maintainer` cada vez que algo cambia. Patrón inspirado en el LLM Wiki de Karpathy.

## Memoria

- [log.md](log.md) — changelog append-only de todo lo que pasa en el sistema.
- [projects.md](projects.md) — tabla compacta de proyectos.
- [people.md](people.md) — stakeholders recurrentes.
- [decisions.md](decisions.md) — decisiones transversales numeradas (D-NNN).
- [_registry.json](_registry.json) — registry de proyectos en JSON. Para que agentes lean sin coste.

## Proyectos activos

- [example-product-launch](../_projects/example-product-launch/README.md) — Lanzamiento de producto X. Estado: En curso.

## Proyectos archivados

_(ninguno todavía. Los proyectos cancelados o completados se mueven a `_projects/_archive/`.)_

## Decisiones transversales

- [D-001](decisions.md#d-001) — Stack tecnológico de `example-product-launch`.

## Plantillas

- [project.md](../_templates/project.md) — README de proyecto.
- [meeting.md](../_templates/meeting.md) — acta de reunión.
- [decision.md](../_templates/decision.md) — decisión registrada.
- [status-line.md](../_templates/status-line.md) — línea para STATUS.md.
- [digest.md](../_templates/digest.md) — resumen periódico.

## Skills y comandos disponibles

- `/setup` — wizard inicial.
- `/ingesta` — procesa el inbox.
- `/nuevo <id>` — crea proyecto.
- `/status-refresh` — regenera STATUS y _registry.
- `/lint` — health check.
- `/digest [periodo]` — resumen periódico.
