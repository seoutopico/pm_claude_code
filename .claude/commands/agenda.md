---
description: Espeja Google Calendar a _memory/calendar.md (solo lectura) vía el worker agenda-syncer, y vincula eventos a proyectos.
disable-model-invocation: true
---

# /agenda

Ejecuta el playbook `agenda` (`.claude/skills/agenda/SKILL.md`). El **líder** lanza al worker
`agenda-syncer` (Haiku, **solo lectura**), que lista los eventos de la ventana y reconstruye
`_memory/calendar.md` en texto plano.

Flujo:

1. Ventana por defecto: **próximos 30 días** (o la que indiques: "esta semana", "hoy", "7 días").
2. `agenda-syncer` espeja calendarios + eventos → `_memory/calendar.md` (sobrescribe).
3. Vincula cada evento a un `id` de proyecto del `_memory/_registry.json` cuando esté claro.
4. Reuniones/hitos vinculados → distribuidos a `_projects/<id>/` (reglas de dominio, "tres escrituras").
5. Entrada en `_memory/log.md`. STATUS si cambian hitos activos.

Requisitos / notas:

- **Conector**: necesita el MCP de Google Calendar autenticado. Configúralo una vez (ver
  `docs/calendar.md`) y autentica con `/mcp`. Sin conector, el playbook **no inventa eventos**: deja
  el fichero con nota de fallo y para (Default-FAIL).
- **Solo lectura**: este comando nunca crea, edita ni borra eventos en tu Google Calendar.
- **`_memory/calendar.md` es derivado**: no lo edites a mano; se regenera en cada `/agenda`.
