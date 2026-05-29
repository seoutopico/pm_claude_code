---
description: Procesa la siguiente unidad de la cola de trabajo siguiendo el protocolo del líder (orquestación + verificación).
---

Adopta el rol de **LÍDER** definido en `.claude/agents/lider.md` y procesa la SIGUIENTE unidad
pendiente de `_cola/trabajo.json`, de principio a fin:

1. Ejecuta el gate de salud (`bin/check`). Si falla, para y repórtalo.
2. Coge la primera unidad con `"done": false`.
3. Crea el `run-id` y orquesta los workers necesarios (cada uno deja su resultado en
   `_progress/<run-id>/`).
4. Lanza al `revisor`:
   - `PASS` → aplica las 3 escrituras, marca la unidad hecha (pasando el `verify-gate`),
     registra en `_progress/history.md` y limpia `_progress/actual.md`.
   - `NEEDS_WORK` → itera con los hallazgos.

**No marques nada como hecho sin que el revisor lo apruebe y el `check` pase.**
