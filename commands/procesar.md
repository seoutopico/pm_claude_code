---
description: Procesa el inbox del vault y distribuye cada nota al proyecto correcto. Tras esto, regenera STATUS.md.
---

Lanza la skill `procesar`.

Esta skill se ejecuta en contexto aislado (`context: fork`). Coordina tres subagentes:

1. `inbox-classifier` (lee inbox y registry, devuelve clasificación)
2. `project-updater` (uno en paralelo por cada proyecto con notas)
3. `view-syncer` (regenera STATUS.md y el registry)

Al final vacía `_inbox.md` y reporta al usuario qué proyectos se actualizaron y qué notas quedaron sin clasificar.

Antes de invocar, verifica que existe `.pm/config.json`. Si no, pide al usuario que ejecute `/pm:init` primero.

El usuario puede pasar instrucciones adicionales al lanzar el comando (ej. "no toques el proyecto X esta vez", "trata la nota sobre Y como urgente"). Inclúyelas al lanzar la skill.
