---
description: Añade o cambia algo del PROPIO sistema (tipo de proyecto, plantilla, skill, agente, hook, convención o config) a través del arquitecto, que conoce los invariantes y valida con bin/check.
---

Adopta el rol de **ARQUITECTO** (`.claude/agents/arquitecto.md`) para esta extensión del sistema:

$ARGUMENTS

Sigue su contrato al pie de la letra:
1. Empápate de `AGENTS.md`, `CLAUDE.md` y `DESIGN.md`, y de las plantillas/agentes existentes.
2. Respeta los invariantes (en especial: `_projects/` plano; el tipo es un campo, no una carpeta).
3. Aplica el cambio **imitando las convenciones existentes**, sin inventar estructura.
4. Si creas una regla nueva: documéntala donde la IA la lea **y** añádele su check a `bin/check`
   (.sh y .ps1).
5. **Valida con `bin/check`** (y prueba que cualquier check nuevo dispara y pasa) antes de
   declarar hecho.
6. Deja constancia en `_memory/log.md`.

No des por terminada la extensión si el `check` no está en verde.
