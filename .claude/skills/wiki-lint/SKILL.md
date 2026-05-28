---
name: wiki-lint
description: Health check del sistema. Detecta contradicciones entre memoria y proyectos, páginas huérfanas, gaps de información, referencias rotas. Trigger con "lint", "salud del sistema", "/lint".
---

# Skill: Wiki lint

## Cuándo se activa

Cuando el usuario lanza `/lint`, pide "comprueba la salud del sistema", "busca inconsistencias", "auditoría", o periódicamente como parte de la rutina (recomendado: semanal).

## Qué hace

Recorre el sistema completo (`_memory/`, `_projects/`, `_inbox/`) buscando problemas. Reporta. **No corrige automáticamente**: el usuario decide qué arreglar.

Patrón inspirado en el `Lint` del LLM Wiki de Karpathy.

## Qué busca

### Contradicciones
- Un proyecto en `_projects/<id>/README.md` dice `Estado: Cancelado` pero `_memory/projects.md` lo lista como activo.
- `_memory/_registry.json` desactualizado respecto a los READMEs.
- `STATUS.md` con fechas o estados que no coinciden con los proyectos.

### Páginas huérfanas
- Proyecto en `_projects/` que no aparece en `_memory/projects.md` ni en `_registry.json`.
- Persona mencionada en varios proyectos pero sin entrada en `_memory/people.md`.
- Decisión mencionada (`D-NNN`) en un proyecto pero ausente en `_memory/decisions.md`.

### Gaps
- Proyecto sin reuniones desde hace más de 30 días pero con estado "En curso".
- Proyecto con bloqueos sin resolver desde hace más de 14 días.
- Inbox no procesado con notas pendientes desde hace más de 7 días.

### Estructura
- Carpetas de proyecto sin `README.md`.
- READMEs sin sección de estado o sin próximo hito.
- Plantillas modificadas sin `{{placeholders}}` (señal de uso accidental como proyecto).

### Memoria
- `_memory/log.md` sin entradas en los últimos 14 días pero con cambios en proyectos (señal de que el log no se mantiene).
- Entradas del log sin formato `## [YYYY-MM-DD]` parseable.

## Cómo proceder

1. **Recorre el sistema** con Glob y Grep. No leas archivos completos si no hace falta — busca patrones específicos.

2. **Agrupa hallazgos** por categoría (Contradicciones, Huérfanas, Gaps, Estructura, Memoria).

3. **Prioriza**: Críticas (contradicciones de estado, datos perdidos) > Medias (gaps, huérfanas) > Bajas (formato).

4. **Reporta** al usuario una tabla:
   ```
   | Severidad | Categoría | Hallazgo | Cómo arreglarlo |
   |---|---|---|---|
   ```

5. **No arregles automáticamente**. Sugiere qué comando o acción manual lo resuelve.

6. **Añade al log**:
   ```
   ## [YYYY-MM-DD] lint | <N> hallazgos (C: X, M: Y, B: Z)
   ```

## Output esperado

Una tabla agrupada por severidad, con cada hallazgo + cómo arreglarlo. Si todo está limpio, un mensaje corto "Sistema sano".

## Reglas

- **Solo reporta, no toca nada** (excepto añadir al log).
- **Sugiere comandos concretos** (`/status-refresh`, `/ingesta`, "edita manualmente X") en lugar de descripciones vagas.
- **Si encuentras algo que no entiendes**, listalo en una sección "Requiere revisión humana" en vez de adivinar.
