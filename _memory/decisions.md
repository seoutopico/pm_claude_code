# Decisiones transversales

> Decisiones que afectan a varios proyectos o al sistema en sí. Numeradas `D-NNN` de forma incremental. Nunca se renumera. Si una decisión queda obsoleta, se añade una decisión nueva (`D-NNN+k`) que la supersede, no se borra la anterior.
>
> Las decisiones específicas de un solo proyecto viven en `_projects/<id>/decisions/`, no aquí.

---

## D-001 — Stack tecnológico para `example-product-launch`

- **Fecha**: 2026-05-15
- **Contexto**: arrancando el proyecto de lanzamiento. Hay que elegir base de datos y framework backend rápido para el MVP.
- **Decisión**: PostgreSQL + Node.js con TypeScript. Frontend con React.
- **Alternativas consideradas**: MongoDB (descartado por necesidad de joins relacionales en pricing), Python/FastAPI (descartado por preferencia del equipo).
- **Consecuencias**: el equipo necesita reforzar formación TS. Onboarding técnico añade 2 días.
- **Supersedido por**: _(ninguno)_
