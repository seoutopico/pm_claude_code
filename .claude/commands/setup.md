---
description: Wizard inicial. Personaliza CLAUDE.md, registra al usuario y opcionalmente crea el primer proyecto.
disable-model-invocation: true
---

# /setup

Estás ejecutando el setup inicial del sistema `claude.pm`. Es la primera y única vez que se lanza tras clonar el repo (relanzarlo más adelante es seguro, sólo re-pregunta).

## Flujo

Haz al usuario **tres preguntas, no más**:

### 1. Nombre y rol

> "¿Cómo te llamas y cuál es tu rol?"

Ejemplo de respuesta: "Aina, PM en editorial". Sin profundizar.

### 2. ¿Quieres que añada un proyecto inicial real?

> "¿Tienes un proyecto activo ahora mismo? Si sí, dime el nombre. Si no, di 'saltar' y dejamos solo el ejemplo `example-product-launch` que ya viene incluido."

Si dice un nombre → lo crearás tras terminar las preguntas siguiendo el playbook `.claude/skills/nuevo-proyecto/SKILL.md` (léelo y ejecuta sus pasos; en modo estricto no se auto-invoca).
Si dice "saltar" → no creas nada, el usuario tiene el dummy como referencia.

### 3. Cadencia de digest

> "¿Cada cuánto quieres un resumen automático: semanal, mensual o ninguno?"

Default razonable: `semanal`.

## Acciones a ejecutar tras las respuestas

1. **Actualiza `CLAUDE.md`** sustituyendo en la sección "Personalizado por el usuario":
   - `Nombre: <nombre>`
   - `Rol: <rol>`
   - `Cadencia de digest: <semanal/mensual/ninguno>`
   - Elimina la línea `> **TODO /setup**: ...` y el sufijo `_(pendiente de /setup)_`.

2. **Crea el proyecto inicial** si el usuario lo pidió, siguiendo el playbook `.claude/skills/nuevo-proyecto/SKILL.md` (es bootstrap: la cola aún no existe, así que aquí lo creas directamente; a partir de entonces todo trabajo va por `/procesar`).

3. **Añade entrada al log**:
   ```
   ## [YYYY-MM-DD] setup | <nombre>
   - Usuario configurado.
   - Cadencia digest: <valor>.
   - Proyecto inicial: <id o ninguno>.
   ```

4. **Recomienda los siguientes pasos** en pantalla:
   - "Apunta cosas sueltas en `_inbox/_inbox.md` durante el día."
   - "Cuando quieras, ejecuta `/ingesta` para distribuirlas."
   - "Lanza `/status-refresh` cada vez que cambies varios proyectos."
   - "Lee `docs/getting-started.md` si te quedan dudas."

## Reglas

- **Solo tres preguntas**. No conviertas el setup en un cuestionario.
- **Sin defaults invisibles**. Cualquier default que apliques (cadencia "semanal" por ejemplo) lo declaras antes de aplicarlo.
- **Si el usuario ya está configurado** (la sección "Personalizado por el usuario" no tiene `(pendiente de /setup)`), confirma antes de sobrescribir.
- **No instales nada, no clones nada, no toques otras rutas**. Solo CLAUDE.md, posiblemente un proyecto nuevo, y log.
