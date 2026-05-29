---
description: Crea un nuevo proyecto con estructura completa y lo registra en memoria.
argument-hint: <id-del-proyecto>
disable-model-invocation: true
---

# /nuevo

Crea un proyecto nuevo a partir de la plantilla `_templates/project.md`.

**Uso**: `/nuevo <id-del-proyecto>` — por ejemplo `/nuevo lanzamiento-producto-x`.

Si no se da ID, pregúntalo. Si se da un nombre largo con espacios, convíertelo a slug.

Invoca el skill `nuevo-proyecto`, que:

1. Crea `_projects/<id>/` con subcarpetas `meetings/`, `decisions/`, `docs/`.
2. Rellena `README.md` desde la plantilla.
3. Registra el proyecto en:
   - `_memory/projects.md`
   - `_memory/_registry.json`
   - `_memory/log.md`
   - `STATUS.md`
4. Pregunta al usuario lo mínimo para rellenar el README: estado, stakeholders, próximo hito.
5. Reporta la ruta y los siguientes pasos sugeridos.

**No sobrescribe proyectos existentes.** Si `_projects/<id>/` ya existe, propone sufijos o pide confirmación.
