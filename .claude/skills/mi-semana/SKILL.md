---
name: mi-semana
description: Genera un briefing prospectivo de la semana (qué hay que hacer) cruzando hitos/bloqueos de proyectos con los eventos del espejo de calendario, y lo deja en MI-SEMANA.md. Trigger con "qué tengo que hacer esta semana", "mi semana", "plan de la semana", "/mi-semana".
disable-model-invocation: true
---

# Skill: Mi semana

## Cuándo se activa

Cuando el operador lanza `/mi-semana` o pregunta qué tiene que **hacer** esta semana ("mi semana",
"plan de la semana"). En **modo estricto** no se auto-invoca: es un playbook que el **líder** lee y
ejecuta orquestando al worker `semana-planner`.

> **No confundir con `/agenda`.** `/agenda` *materializa* tu Google Calendar a `_memory/calendar.md`
> (escribe el espejo, mira el feed vivo). `/mi-semana` *consume* ese espejo ya escrito y lo cruza
> con tus proyectos para decirte qué hacer (no toca el conector). Flujo natural: `/agenda` para
> tener datos frescos → `/mi-semana` para el plan. `/mi-semana` funciona también sin calendario.

## Filosofía (por qué un briefing derivado y no una respuesta al vuelo)

El "qué hago esta semana" no se improvisa en el chat: se **materializa** a `MI-SEMANA.md` en la raíz
(igual que `STATUS.md` es la foto del ahora, esto es el plan de los próximos días). Así es revisable,
abrible en cualquier editor y reproducible. La síntesis trabaja sobre **texto ya en el repo**
(`_registry.json`, READMEs, `calendar.md`), nunca sobre fuentes vivas — eso preserva el invariante de
que solo `agenda-syncer` toca el conector de calendario.

## Cómo proceder (rol líder)

1. **Determina la ventana.** Por defecto, de **hoy al domingo de esta semana** (lunes→domingo). Si
   el operador acotó ("próximos 7 días", una semana concreta), pásasela al worker.

2. **Lanza el worker `semana-planner`** (subagente, Haiku, solo lectura) con la fecha de hoy y la
   ventana. El worker:
   - lee `_memory/_registry.json` + los READMEs relevantes → hitos, bloqueos, próximos pasos,
   - lee `_memory/calendar.md` **si existe y tiene filas reales** → cruza eventos con proyectos,
   - **reconstruye `MI-SEMANA.md`** entero a partir de `_templates/semana.md`.

3. **Sin calendario** (espejo ausente, vacío o con nota de fallo): el worker genera el briefing
   **solo con proyectos** y lo marca en la cabecera. No es un fallo — es degradación con gracia. Si
   el operador quería incluir el calendario, sugiérele correr `/agenda` primero.

4. **Muestra `MI-SEMANA.md`** al operador en la conversación.

## Output esperado

`MI-SEMANA.md` regenerado y mostrado en pantalla. Mensaje al operador con: ventana usada, nº de
hitos, nº de eventos cruzados, y si el briefing incluyó calendario o no.

## Reglas

- **Solo lectura / síntesis.** Este playbook NO muta proyectos, NO crea reuniones y **NO escribe en
  el log** (no deja rastro fuera de `MI-SEMANA.md`). Para reflejar algo en un proyecto, eso pasa por
  el arnés (`/procesar`); para refrescar el calendario, `/agenda`.
- **`MI-SEMANA.md` es derivado**: se regenera entero, nadie lo edita a mano.
- **Nunca inventes** hitos ni eventos. Sin datos en una sección, dilo explícito.
- **No toca el conector de calendario.** Trabaja sobre el espejo en texto; el feed vivo es de `/agenda`.
