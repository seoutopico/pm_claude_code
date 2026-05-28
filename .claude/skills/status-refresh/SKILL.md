---
name: status-refresh
description: Regenera STATUS.md y _memory/_registry.json escaneando todos los proyectos activos. Trigger con "actualiza STATUS", "refresca el dashboard", "/status-refresh".
---

# Skill: Status refresh

## Cuándo se activa

Cuando el usuario lanza `/status-refresh`, pide "actualiza STATUS.md", "refresca el dashboard", o tras una operación masiva (varios proyectos cambiados) que requiera resincronizar la vista.

## Qué hace

Lee todos los `_projects/*/README.md` (excepto `_projects/_archive/`) y regenera dos archivos derivados:

1. `STATUS.md` — tabla legible para el usuario.
2. `_memory/_registry.json` — JSON estructurado para que agentes lo consuman sin escanear todos los markdowns.

**Estos dos archivos son derivados**. La fuente de verdad sigue siendo cada `_projects/<id>/README.md`. Si hay conflicto, mandan los READMEs.

## Cómo proceder

1. **Lista proyectos activos** con `Glob _projects/*/README.md` (excluye `_archive/`).

2. **Lee cada README** y extrae:
   - `id` (nombre de la carpeta)
   - `nombre humano` (primer H1 del README)
   - `estado` (campo `Estado:` o sección equivalente)
   - `proximo_hito` (próxima fecha con descripción)
   - `bloqueos` (sección de blockers, si existe)
   - `actualizado` (fecha de modificación del README o último update interno)
   - `owner` o `stakeholders` (si está)

3. **Regenera `_memory/_registry.json`** con un array de objetos:
   ```json
   {
     "generated_at": "YYYY-MM-DD",
     "projects": [
       {
         "id": "...",
         "path": "_projects/.../",
         "name": "...",
         "status": "...",
         "next_milestone": "...",
         "blockers": [...],
         "updated": "YYYY-MM-DD",
         "owner": "..."
       }
     ]
   }
   ```

4. **Regenera `STATUS.md`** con:
   - Encabezado con timestamp.
   - Tabla "Proyectos activos" (columnas: ID, Proyecto, Estado, Próximo hito, Bloqueos, Actualizado).
   - Sección "Atención requerida" listando bloqueos.
   - Sección "Próximas fechas" con los próximos hitos ordenados cronológicamente.

5. **Actualiza `_memory/projects.md`** si encontraste proyectos nuevos no registrados.

6. **Añade al log**:
   ```
   ## [YYYY-MM-DD] status-refresh | <N> proyectos sincronizados
   ```

## Output esperado

Mensaje al usuario con:
- Cuántos proyectos se han sincronizado.
- Si encontraste discrepancias o proyectos sin registrar.
- Rutas modificadas (`STATUS.md`, `_memory/_registry.json`, posiblemente `_memory/projects.md`).

## Reglas

- **No modifiques READMEs de proyectos**. Son la fuente, no el destino.
- **Si un README está malformado** (sin H1, sin estado), avisa al usuario y registra el proyecto con campos `null` o `TBD`. No silencies errores.
- **Idempotente**: lanzar `/status-refresh` varias veces sin cambios debe producir output idéntico.
