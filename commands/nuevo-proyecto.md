---
description: Crea un proyecto nuevo (carpeta, README desde plantilla, entrada en el registry, fila en STATUS).
---

Lanza la skill `nuevo-proyecto`.

La skill es autocontenida (no usa subagentes). Pregunta interactivamente al usuario: id (kebab-case), name, status, priority, keywords, owner (opcional), descripción una línea (opcional). Valida que el id sea único y crea la estructura completa.

Si el usuario ya pasa algún dato en el mensaje del comando (ej. `/pm:nuevo-proyecto id="mi-proyecto" name="Mi Proyecto"`), úsalos como respuestas por defecto del wizard interactivo (no las hagas preguntar de nuevo).
