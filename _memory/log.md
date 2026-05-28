# Log

> Changelog append-only del sistema. Formato ritual: `## [YYYY-MM-DD] operacion | titulo`. Las entradas se añaden al final, nunca se editan ni se borran. Si una entrada es incorrecta, se añade otra que la corrija con `op: note`.
>
> Operaciones reconocidas: `ingest`, `new-project`, `status-refresh`, `lint`, `digest`, `decision`, `archive`, `setup`, `note`.

---

## [2026-05-15] new-project | example-product-launch
- Proyecto creado a partir de `_templates/project.md`.
- Estado inicial: En curso.
- Stakeholders: Producto, Diseño, Legal.
- Próximo hito: Beta cerrada (2026-06-12).

## [2026-05-15] ingest | 1 nota procesada
- Distribuida a: `_projects/example-product-launch/meetings/2026-05-15_kickoff.md`.

## [2026-05-15] decision | D-001 stack tecnológico
- Decisión transversal registrada en `_memory/decisions.md`.

## [2026-05-22] ingest | 1 nota procesada
- Distribuida a: `_projects/example-product-launch/meetings/2026-05-22_review.md`.
- Bloqueo registrado en el README del proyecto: pendiente OK legal.

## [2026-05-28] status-refresh | 1 proyecto sincronizado
- STATUS.md y _registry.json regenerados.
- Detectado bloqueo activo en `example-product-launch`.
