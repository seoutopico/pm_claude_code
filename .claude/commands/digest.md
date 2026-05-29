---
description: Genera un resumen periódico (semanal por defecto) de avances, decisiones, bloqueos y próximos hitos.
argument-hint: [semana|mes|YYYY-MM-DD..YYYY-MM-DD]
disable-model-invocation: true
---

# /digest

Invoca el skill `digest`. Produce un resumen narrativo del periodo solicitado.

**Periodos válidos**:
- Sin argumento → última semana (lunes pasado hasta hoy).
- `/digest mes` → último mes natural.
- `/digest YYYY-MM-DD..YYYY-MM-DD` → rango explícito.

Se basa en:
- Entradas de `_memory/log.md` en el rango.
- Reuniones de `_projects/*/meetings/` en el rango.
- Decisiones registradas en el rango.

El digest queda guardado en `_memory/digests/<YYYY-MM-DD>_<periodo>.md` y se muestra al usuario en pantalla.

Si el periodo no tiene movimiento, lo dice explícitamente. No inventa.
