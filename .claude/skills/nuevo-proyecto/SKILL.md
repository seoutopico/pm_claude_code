---
name: nuevo-proyecto
description: Crea un proyecto nuevo desde plantilla con su estructura completa (README, carpetas de reuniones, decisiones, docs) y lo registra en memoria. Trigger con "nuevo proyecto", "crear proyecto", "/nuevo".
disable-model-invocation: true
---

# Skill: Nuevo proyecto

## Cuándo se activa

Cuando el usuario lanza `/nuevo <id>`, dice "crea un proyecto", "abre un proyecto nuevo", o equivalente.

## Qué hace

Crea la estructura completa de un proyecto en `_projects/<id>/` y lo registra en la memoria del sistema.

## Cómo proceder

1. **Determina el ID del proyecto**. Slug-case, sin espacios ni acentos. Si el usuario sólo dio un nombre largo, conviértelo:
   - "Lanzamiento producto X" → `lanzamiento-producto-x`
   - "Q3 Revenue Push" → `q3-revenue-push`

2. **Pregunta lo mínimo imprescindible** si no te lo han dicho:
   - Estado inicial (por defecto: `En curso`).
   - Stakeholders (puede ser vacío).
   - Próximo hito o fecha clave (puede ser TBD).

3. **Crea la estructura**:
   ```
   _projects/<id>/
   ├── README.md            (desde _templates/project.md)
   ├── meetings/            (vacía)
   ├── decisions/           (vacía)
   └── docs/                (vacía)
   ```

4. **Rellena el README.md** del proyecto usando `_templates/project.md`. Sustituye:
   - `{{PROYECTO}}` → nombre humano del proyecto.
   - `{{ID}}` → id slug.
   - `{{FECHA}}` → fecha de hoy.
   - `{{ESTADO}}`, `{{STAKEHOLDERS}}`, `{{PROXIMO_HITO}}` con lo recogido.

5. **Registra el proyecto**:
   - Añade una línea a `_memory/projects.md` con el formato de la plantilla.
   - Añade el proyecto al `_memory/_registry.json` (objeto `{id, path, status, updated, owner}`).
   - Añade entrada al `_memory/log.md`:
     ```
     ## [YYYY-MM-DD] new-project | <id>
     - Estado: <estado>
     - Stakeholders: <lista>
     ```

6. **Actualiza STATUS.md** añadiendo una fila al proyecto en la tabla.

7. **Reporta al usuario** con la ruta del README y los siguientes pasos sugeridos (primera reunión, primera decisión, alcance).

## Output esperado

```
Proyecto creado: _projects/<id>/

Estructura:
  README.md         (rellenado)
  meetings/         (vacío)
  decisions/        (vacío)
  docs/             (vacío)

Registrado en:
  _memory/projects.md
  _memory/_registry.json
  _memory/log.md
  STATUS.md
```

## Reglas

- **No sobrescribas proyectos existentes**. Si `_projects/<id>/` ya existe, avisa al usuario y propón sufijos (`-v2`, `-2026`) o que confirme sobrescribir.
- **El ID es inmutable**. Una vez creado un proyecto, mover su carpeta es una operación manual del usuario, no del sistema.
- **Siempre regístralo en los 4 sitios**: README, projects.md, _registry.json, log.md. Si fallas en alguno, retrocede los demás.
