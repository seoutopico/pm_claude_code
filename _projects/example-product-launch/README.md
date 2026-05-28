# Lanzamiento producto X

- **ID**: `example-product-launch`
- **Creado**: 2026-05-15
- **Estado**: En curso
- **Owner**: Aina
- **Próximo hito**: 2026-06-12 — Beta cerrada
- **Stakeholders**: Marta García (Producto), Carlos Ruiz (Tech Lead), Legal

## Contexto

Lanzamiento de un nuevo producto (genérico, para demo del sistema `claude.pm`). El objetivo es ilustrar cómo se ve un proyecto completo dentro del sistema: README como fuente de verdad, reuniones, decisiones, docs, todo conectado con la memoria del sistema.

## Alcance

- Definir el MVP con producto y diseño.
- Cerrar stack tecnológico (ver D-001).
- Pasar revisión legal antes de la beta.
- Lanzar beta cerrada con grupo piloto.
- Recoger feedback de las primeras 4 semanas.

## Hitos

| Fecha | Hito | Estado |
|---|---|---|
| 2026-05-15 | Proyecto arrancado | Completado |
| 2026-05-15 | Decisión de stack (D-001) | Completado |
| 2026-05-22 | Review intermedia con equipo | Completado |
| 2026-06-05 | Revisión de seguridad | Pendiente |
| 2026-06-12 | Beta cerrada | Pendiente |
| 2026-07-15 | Lanzamiento abierto | Tentativo |

## Bloqueos

- **[2026-05-22]** Pendiente OK legal antes de la beta. Marta lo lleva. Plazo: antes del 2026-06-05.

## Decisiones

- **D-001** — Stack tecnológico (PostgreSQL + Node.js/TypeScript + React). Transversal, registrada en `_memory/decisions.md`.
- **#001 local** — Modelo de pricing freemium para la beta. Ver [`decisions/001_eleccion-stack.md`](decisions/001_eleccion-stack.md) (es un alias del archivo de decisión inicial; en proyectos reales irían numeradas independientes).

## Reuniones

Las actas están en [`meetings/`](meetings/):
- [2026-05-15 — Kickoff](meetings/2026-05-15_kickoff.md)
- [2026-05-22 — Review intermedia](meetings/2026-05-22_review.md)

## Documentos

- [`docs/alcance.md`](docs/alcance.md) — definición de alcance funcional del MVP.

## Histórico

Más reciente arriba.

- **2026-05-28**: bloqueo legal pendiente confirmado por Marta. Sin nueva fecha de resolución.
- **2026-05-22**: review intermedia. Stack confirmado, identificado bloqueo legal.
- **2026-05-15**: kickoff. Proyecto arrancado. Decisión D-001 tomada el mismo día.
