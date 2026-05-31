---
description: Genera un briefing prospectivo de la semana (qué hay que hacer) en MI-SEMANA.md, cruzando hitos/bloqueos de proyectos con el espejo de calendario, vía el worker semana-planner (solo lectura).
disable-model-invocation: true
---

# /mi-semana

Ejecuta el playbook `mi-semana` (`.claude/skills/mi-semana/SKILL.md`). El **líder** lanza al worker
`semana-planner` (Haiku, **solo lectura**), que cruza proyectos y calendario y reconstruye
`MI-SEMANA.md` en la raíz.

Flujo:

1. Ventana por defecto: **de hoy al domingo de esta semana** (o la que indiques: "próximos 7 días").
2. `semana-planner` lee `_memory/_registry.json` + READMEs + `_memory/calendar.md` (si existe).
3. Cruza eventos con proyectos y reconstruye `MI-SEMANA.md` desde `_templates/semana.md` (sobrescribe).
4. Te muestra el briefing en pantalla.

Notas:

- **No confundir con `/agenda`**: `/agenda` *escribe* el espejo del calendario (toca el feed vivo);
  `/mi-semana` solo *lee* ese espejo y lo cruza con tus proyectos. Corre `/agenda` antes si quieres
  datos de calendario frescos; `/mi-semana` funciona igual sin calendario (briefing solo-proyectos).
- **Solo lectura**: este comando no muta proyectos, no crea reuniones y **no deja rastro en el log**.
  Su única escritura es `MI-SEMANA.md`.
- **`MI-SEMANA.md` es derivado**: no lo edites a mano; se regenera en cada `/mi-semana`.
