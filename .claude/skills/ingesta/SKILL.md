---
name: ingesta
description: Procesa notas sueltas del inbox y las distribuye al proyecto, memoria o decisiones que correspondan. Trigger con "ingesta", "procesa el inbox", "vacía el inbox", "/ingesta".
disable-model-invocation: true
---

# Skill: Ingesta

## Cuándo se activa

Cuando el usuario lanza `/ingesta`, pide procesar el inbox, o escribe algo como "vacía el inbox", "distribuye las notas", "procesa lo que tengo apuntado".

## Qué hace

Lee `_inbox/_inbox.md`, clasifica cada nota libre, y la distribuye al destino correcto. Vacía el inbox al final dejando una cabecera limpia. Añade una entrada al `_memory/log.md`.

## Cómo proceder

1. **Lee el inbox completo** desde `_inbox/_inbox.md`. Cada bloque separado por línea en blanco o por encabezado `##` cuenta como una nota.

2. **Lee el contexto** que necesitas para clasificar bien:
   - `_memory/projects.md` → para saber qué proyectos existen.
   - `_memory/people.md` → para reconocer stakeholders.
   - `_memory/_registry.json` → mismo registry en JSON, más rápido.

3. **Para cada nota, decide destino**:
   - Si menciona un proyecto existente → añadir entrada al histórico de `_projects/<id>/README.md`. Si es una decisión, además a `_projects/<id>/decisions/`.
   - Si menciona reunión con fecha → crear `_projects/<id>/meetings/<YYYY-MM-DD>_<slug>.md` usando `_templates/meeting.md`.
   - Si es información sobre una persona (nuevo stakeholder, cambio de rol) → actualizar `_memory/people.md`.
   - Si es una decisión transversal (no de un solo proyecto) → añadir a `_memory/decisions.md` con ID incremental `D-NNN`.
   - Si es contexto general del sistema → actualizar `_memory/index.md` si corresponde.
   - Si no encaja con nada y parece importante → preguntar al usuario antes de descartar.

4. **Vacía el inbox**. Sobreescribe `_inbox/_inbox.md` con sólo la cabecera limpia (ver `_templates/`). No borres el archivo, lo dejas vacío con su título.

5. **Registra en el log**. Añade entrada a `_memory/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | <N> notas procesadas
   - Distribuidas a: <lista de destinos>
   - Notas no clasificables: <0 o lista>
   ```

6. **Reporta al usuario** un resumen breve: cuántas notas, dónde fueron, si hay alguna que necesite confirmación.

## Output esperado

Un mensaje al usuario con:
- Total de notas procesadas.
- Tabla o lista de "nota → destino".
- Cualquier nota que no supiste clasificar (pidiendo decisión).

## Reglas

- **Nunca pierdas información**. Si dudas, pregunta antes de descartar.
- **El inbox queda vacío al terminar** (sólo cabecera).
- **El log siempre se actualiza** aunque sólo proceses una nota.
- **No metas notas tú en el inbox**. El inbox es del usuario.
