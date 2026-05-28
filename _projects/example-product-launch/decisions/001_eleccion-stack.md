# #001 — Elección de stack tecnológico

> Nota: esta decisión es transversal y la fuente de verdad está en `_memory/decisions.md` como **D-001**. Esta página local del proyecto sirve como referencia rápida y enlace contextual.

- **Fecha**: 2026-05-15
- **Ámbito**: proyecto `example-product-launch` + transversal (afecta otros proyectos futuros del equipo)
- **Tomada por**: Aina, Marta García, Carlos Ruiz
- **Estado**: Activa

## Contexto

Arrancando el proyecto de lanzamiento. Hay que elegir base de datos y framework backend rápido para el MVP. El equipo tiene experiencia mixta entre Node y Python.

## Decisión

PostgreSQL + Node.js con TypeScript. Frontend con React.

## Alternativas consideradas

- **MongoDB**: descartado por la necesidad de joins relacionales en pricing y reportes.
- **Python / FastAPI**: descartado por preferencia del equipo y por consistencia con otros proyectos internos.

## Consecuencias

- El equipo necesita reforzar formación en TypeScript. Onboarding técnico añade unos 2 días por persona nueva.
- Stack consistente con futuros proyectos similares; se podrá compartir tooling.
- Decisión revisable en 6 meses si surgieran limitaciones.

## Referencia transversal

- [`_memory/decisions.md#d-001`](../../../_memory/decisions.md)
