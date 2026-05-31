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

## [2026-05-29] note | arnés enganchado al runtime (modo estricto)
- Diagnóstico: el arnés no se activaba en uso real; al pedir trabajo en lenguaje natural, Claude Code disparaba la skill de dominio directamente y se saltaba cola/líder/revisor/Default-FAIL.
- Causa: AGENTS.md no se autocarga, no había hook SessionStart, y las skills/comandos se auto-invocaban.
- Arreglo (Fase 5, vía arquitecto): hook `SessionStart` (check + protocolo) + `@AGENTS.md` en CLAUDE.md + `disable-model-invocation: true` en las 5 skills y 6 comandos de dominio (pasan a playbooks). `bin/check` (.ps1/.sh) ampliado con la sección 6 que verifica los 3 enganches; probado que dispara ante violación y pasa al cumplirse.
- Decisión del operador: modo ESTRICTO (todo pasa por el arnés). Ver DESIGN.md §11-bis y AGENTS.md "Modo ESTRICTO".

## [2026-05-30] setup | integración Google Calendar (rama v3, solo lectura)
- Objetivo: traer Google Calendar al sistema sin perder la filosofía (repo-as-system, texto plano, todo por el arnés).
- Diseño: el calendario se trata como el inbox — se materializa a `_memory/calendar.md` (derivado), no se consulta en vivo. Sitio canónico ya previsto en AGENTS.md (invariante "_projects plano").
- Piezas: `.mcp.json` (MCP remoto oficial de Google, pinneado), worker `agenda-syncer` (Haiku, SOLO lectura), playbook `agenda` (skill+comando `/agenda`, `disable-model-invocation`), `_memory/calendar.md` (semilla), `docs/calendar.md` (alta + seguridad).
- Garantías deterministas (`bin/check` §7): el worker no tiene tools de escritura de calendario (invariante read-only) y el espejo existe. Prompt-injection de eventos contenido: entra como dato a un worker acotado, no como orden al líder.
- Pendiente operador: dar de alta el conector (`/mcp`) con scopes readonly. Volcado hacia el calendario NO incluido (dirección inversa, gateada, futura vía /extender).

## [2026-05-31] setup | feature /mi-semana (briefing prospectivo de la semana, vía arquitecto)
- Objetivo: responder "qué tengo que HACER esta semana" cruzando hitos/bloqueos de proyectos con los eventos del calendario. Complementa `/digest` (mira atrás) y `/status-refresh` (foto del ahora).
- Diseño: la síntesis trabaja sobre TEXTO ya en el repo (`_registry.json` + READMEs + `_memory/calendar.md`), nunca sobre el feed vivo. Salida en `MI-SEMANA.md` (raíz, derivado como STATUS.md, sin rastro en log).
- Piezas: worker `semana-planner` (Haiku, solo lectura, SIN tools MCP), plantilla `_templates/semana.md`, playbook `mi-semana` (skill + comando `/mi-semana`, ambos `disable-model-invocation`), semilla `MI-SEMANA.md`.
- Relación con `/agenda`: separación de responsabilidades — `/agenda` materializa el calendario (toca el feed); `/mi-semana` solo consume el espejo y degrada con gracia a solo-proyectos si no existe. Así solo `agenda-syncer` toca el conector.
- Garantía determinista (`bin/check` §8, .ps1/.sh): `semana-planner` no expone tools MCP (la línea `tools:` no contiene `mcp`); plantilla y salida presentes. `mi-semana` añadido a la lista §6c (blindado, no auto-invocable). Probado que el §8 dispara ante violación (worker con `mcp__calendar__list_events`) y pasa al cumplirse, en ambas versiones.
- Docs actualizados: AGENTS.md (playbooks, modelos, mapa), CLAUDE.md (rutas, comandos), llms.txt.
