# AGENTS.md — Punto de entrada del arnés (claude.pm V2)

> **Esto es lo primero que lee cualquier agente en este repo (rama `v2`).**
> Define el protocolo, el mapa del repo y las reglas. Las reglas de dominio (cómo se
> gestionan proyectos, inbox, memoria) están en `CLAUDE.md` y siguen vigentes.

La V2 es la V1 envuelta en un **arnés**: un protocolo de arranque que verifica salud, una cola
de trabajo explícita, y un contrato que impide declarar algo "hecho" sin demostrarlo. El modelo
es el cerebro intercambiable; este arnés se queda.

---

## Protocolo de sesión (síguelo SIEMPRE)

```
1. Ejecuta el check de salud:
     Windows:     powershell -NoProfile -File bin/check.ps1
     mac/linux:   bash bin/check.sh
   → Si sale con error (exit 1), PARA y reporta. No se trabaja sobre un sistema roto.

2. Lee _progress/actual.md   → ¿quedó algo a medias en la última sesión?
3. Lee _cola/trabajo.json    → coge UNA unidad con "done": false (una sola, no multitarea).
4. ORQUESTA: adopta el rol de líder (.claude/agents/lider.md) o lanza /procesar.
     El líder reparte el trabajo a los workers (cada uno deja su resultado en _progress/<run-id>/).
5. VERIFICA: lanza al revisor (.claude/agents/revisor.md). Devuelve PASS o NEEDS_WORK.
6. Si PASS: aplica el invariante de las TRES ESCRITURAS y marca la unidad "done": true.
     → El hook verify-gate ejecutará el check; si no pasa, NO te dejará marcarlo.
     Si NEEDS_WORK: itera con los hallazgos. No marques nada hecho.
7. Registra en _progress/history.md, limpia _progress/actual.md y, si procede, commit.
```

---

## El contrato Default-FAIL (no negociable)

> Por defecto, **nada está hecho**. Una unidad solo pasa a `"done": true` cuando se demuestra.

Una unidad de `_cola/trabajo.json` se puede cerrar **solo si**:

1. Se cumplen las **tres escrituras** (regla operativa nº1 de `CLAUDE.md`):
   - `_projects/<id>/README.md` del proyecto afectado, actualizado.
   - Entrada nueva en `_memory/log.md` (append-only).
   - `STATUS.md` refrescado si cambia el estado activo.
2. `bin/check` sale con **exit 0**.

El hook **`.claude/hooks/verify-gate`** intercepta cualquier intento de escribir `"done": true`
en `_cola/trabajo.json`: si `check` no pasa, **bloquea la escritura**. La regla deja de
depender de tu memoria y pasa a ser un invariante que el sistema hace cumplir.

---

## Mapa del repo (no releas todo; ve directo)

| Ruta | Qué es | Capa |
|---|---|---|
| `AGENTS.md` | Este protocolo. Punto de entrada. | arnés |
| `CLAUDE.md` | Reglas de dominio (proyectos, inbox, memoria). | dominio (V1) |
| `bin/check.sh` / `bin/check.ps1` | Gate de salud. Verifica invariantes. Exit 0/1. | arnés |
| `_cola/trabajo.json` | Cola de trabajo. Unidades con `done:false`. | arnés |
| `_progress/actual.md` | Ejecución en curso (se limpia al cerrar). | arnés |
| `_progress/history.md` | Changelog append-only de ejecuciones. | arnés |
| `_control/STOP` | Si existe → parar (kill-switch). | arnés |
| `_control/STEER.md` | Si tiene contenido → redirige sin reiniciar. | arnés |
| `.claude/agents/` | Líder, revisor y los workers (subagentes V1). | arnés |
| `.claude/hooks/` | `verify-gate`, etc. | arnés |
| `_inbox/_inbox.md` | Notas del usuario. **El arnés nunca escribe aquí.** | dominio |
| `_projects/<id>/README.md` | Fuente de verdad de cada proyecto. | dominio |
| `_memory/_registry.json` | Tabla de proyectos en JSON. Contexto rápido. | dominio |
| `_memory/log.md` | Changelog del sistema. Append-only. | dominio |
| `_templates/` | Plantillas. Mandan al crear cosas nuevas. | dominio |
| `STATUS.md` | Dashboard. | dominio |

**Eficiencia de contexto**: para saber el estado del sistema, lee `_memory/_registry.json`
(JSON compacto). No escanees `_projects/**/*.md`.

---

## Modelos (presupuesto del arnés)

Cada agente declara su cerebro en el frontmatter de `.claude/agents/*.md`. Principio: cerebro
barato para trabajo mecánico, caro solo para juicio.

| Agente | Modelo |
|---|---|
| `lider` (orquestador) | Sonnet |
| workers (`inbox-classifier`, `project-updater`, `status-syncer`, `wiki-maintainer`) | Haiku |
| `revisor` (evaluador) | Sonnet |

El **líder** es el rol que adopta la sesión principal al procesar la cola (lánzalo con
`/procesar`): lee la cola, reparte a los workers y cierra. El **revisor** se lanza como
subagente con contexto limpio y sin permisos de escritura para verificar antes de cerrar.

---

## Controles del operador (tú)

- **Parar en seco**: crea el fichero `_control/STOP`.
- **Redirigir sin reiniciar**: escribe en `_control/STEER.md`.

*(El cableado completo de estos controles llega en la Fase 3.)*
