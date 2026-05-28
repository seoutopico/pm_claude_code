---
name: digest
description: Genera un resumen periódico (semanal, mensual o ad-hoc) de avances, decisiones, bloqueos y próximos hitos. Trigger con "digest", "resumen semanal", "resumen del mes", "/digest".
---

# Skill: Digest

## Cuándo se activa

Cuando el usuario pide un "resumen", "digest", "informe semanal/mensual", o lanza `/digest [periodo]`.

## Qué hace

Lee el sistema y produce un resumen narrativo del periodo solicitado. No es un dashboard (eso es `STATUS.md`): es prosa breve para enviar por email, compartir con un manager, o leer al final del día.

## Cómo proceder

1. **Determina el periodo**:
   - Default: última semana (lunes pasado hasta hoy).
   - `/digest mes` → último mes natural.
   - `/digest YYYY-MM-DD..YYYY-MM-DD` → rango explícito.

2. **Recoge eventos del periodo** filtrando por fecha:
   - Entradas de `_memory/log.md` en el rango.
   - Reuniones en `_projects/*/meetings/<fecha>_*.md` cuya fecha caiga en el rango.
   - Decisiones en `_projects/*/decisions/` o en `_memory/decisions.md` registradas en el rango.
   - Cambios de estado de proyectos (si están en log).

3. **Lee `_templates/digest.md`** para la estructura.

4. **Rellena las secciones**:
   - **Avances**: qué se completó, en qué proyectos.
   - **Decisiones**: tomadas en el periodo, con enlace.
   - **Bloqueos**: nuevos, resueltos, pendientes.
   - **Próximos hitos**: fechas en los próximos 7-14 días (según periodo).
   - **Atención**: cosas que requieren input humano.

5. **Sé conciso**. Un digest semanal cabe en pantalla. Un digest mensual no más de una página A4 leída con calma.

6. **Guarda el digest** en `_memory/digests/<YYYY-MM-DD>_<periodo>.md`. Si la carpeta no existe, créala.

7. **Añade al log**:
   ```
   ## [YYYY-MM-DD] digest | <periodo>
   - Guardado en: _memory/digests/<...>
   ```

8. **Muestra el digest** al usuario en la conversación.

## Output esperado

El digest rellenado y guardado. Mensaje al usuario:
- Periodo cubierto.
- Ruta donde se guardó.
- El contenido en pantalla.

## Reglas

- **Hechos, no opiniones**. El digest documenta lo ocurrido, no celebra ni dramatiza.
- **Enlaces relativos** a proyectos, reuniones, decisiones para que sean navegables desde Obsidian o el editor.
- **Si el periodo no tiene movimiento**, el digest lo dice explícitamente ("Sin avances registrados en proyectos activos") en vez de inventar.
- **Personalízalo a tu cadencia real** editando `_templates/digest.md`. La plantilla por defecto es genérica.
