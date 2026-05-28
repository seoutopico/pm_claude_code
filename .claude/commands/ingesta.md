---
description: Procesa _inbox/_inbox.md, clasifica cada nota y la distribuye al destino correcto.
---

# /ingesta

Invoca el skill `ingesta`. Lee `_inbox/_inbox.md`, clasifica cada nota usando el sub-agente `inbox-classifier`, y distribuye a:

- `_projects/<id>/README.md` (histórico)
- `_projects/<id>/meetings/<fecha>_<slug>.md` (reuniones)
- `_projects/<id>/decisions/<NNN>_<slug>.md` (decisiones de proyecto)
- `_memory/decisions.md` (decisiones transversales)
- `_memory/people.md` (actualizaciones de personas)

Al terminar:
- Vacía `_inbox/_inbox.md` (deja sólo la cabecera).
- Añade entrada a `_memory/log.md` con conteo y destinos.
- Reporta resumen al usuario.

Si alguna nota no se puede clasificar con confianza, **pregunta al usuario** antes de descartar.
