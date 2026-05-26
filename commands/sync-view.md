---
description: Regenera STATUS.md y el registry leyendo todos los READMEs de proyecto. Útil tras editar READMEs a mano.
---

Lanza directamente el subagente `view-syncer` (sin skill orquestadora; es una operación atómica).

El subagente:

1. Lee `.pm/config.json`
2. Glob `{projects_root}/*/README.md` excluyendo carpetas que empiezan por `_`
3. Extrae frontmatter YAML de cada README
4. Regenera `STATUS.md` desde la plantilla `TPL_status.md` del vault
5. Reescribe el array `projects[]` del registry preservando `keywords` y `metadata`

Tras la ejecución, muestra al usuario:

- Número de proyectos detectados
- Cuántos quedaron en STATUS.md (filtrados por `taxonomies.project_states_active` si está definido)
- Avisos de READMEs sin frontmatter (necesitan atención manual)
- Cualquier id duplicado (caso edge: dos carpetas con mismo frontmatter id)
