# Guion de demo — V1 vs V2 (el arnés)

Material para dar la clase. La idea: enseñar **qué es un arnés (harness)** comparando la misma
herramienta sin arnés (V1) y con arnés (V2), sobre un repo que no es "otra app de to-dos" sino
un sistema real de gestión de proyectos.

> Las dos versiones son **ramas git**: `main` = V1, `v2` = el arnés. Cambia con `git switch`.

---

## 0. El gancho (2 min)

> "Las grandes mejoras en agentes de IA no vienen tanto de mejores modelos como de **mejores
> entornos alrededor del modelo**. A ese entorno se le llama arnés. Hoy montamos uno."

Tres pilares (los repetiremos al final):
1. **El repositorio es el sistema** — el arnés vive en ficheros, no en un chat.
2. **Orquestación multiagente** — un líder reparte, los workers ejecutan, un revisor verifica.
3. **Verificación** — el trabajo se demuestra, no se afirma.

---

## 1. El "antes": V1 (3 min)

```bash
git switch main
```

Enseña el sistema: `_inbox/`, `_projects/`, `_memory/`, las skills (`/ingesta`, `/lint`).
Funciona, pero **tú diriges cada paso** y nada impide declarar algo "hecho" sin estar hecho.
Pregunta a la clase: *¿qué pasa si el agente dice "proyecto actualizado" pero se olvidó del
log?* En la V1, nada lo detecta.

---

## 2. El "después": V2, y el truco del diff (5 min)

```bash
git switch v2
git diff main v2 --stat      # <-- ESTO es el arnés, en una pantalla
```

> "Todo lo que veis en este diff es la fontanería que convierte un chatbot en un agente fiable.
> No hemos cambiado el dominio: seguimos gestionando proyectos. Hemos añadido el envoltorio."

Abre `AGENTS.md`: el **punto de entrada**. Protocolo, mapa del repo, contrato. Es lo primero que
lee cualquier agente.

---

## 3. Pilar 3 en vivo: el contrato Default-FAIL (5 min)

**El gate de salud manda:**

```bash
powershell -NoProfile -File bin/check.ps1     # (o bash bin/check.sh)
```

Sale verde. Ahora **rompe algo** a propósito:

```bash
mkdir _projects/proyecto-fantasma
powershell -NoProfile -File bin/check.ps1     # exit 1: detecta el huérfano
rmdir _projects/proyecto-fantasma
```

**El hook que no te deja mentir:** intenta marcar una tarea como hecha con el sistema roto y el
`verify-gate` la bloquea (exit 2). Mensaje clave para la clase:

> "La IA está entrenada para *parecer* verosímil. El arnés la obliga a *demostrar*. Aquí, marcar
> 'hecho' requiere que el check pase; si no, el hook lo impide. No depende de que el modelo se
> porte bien."

---

## 4. Pilar 2 en vivo: orquestación (5 min)

```
/procesar
```

La sesión principal adopta el rol de **líder** (`.claude/agents/lider.md`):
1. Corre el `check`.
2. Coge una unidad de `_cola/trabajo.json`.
3. Lanza **workers** (en Haiku, baratos) que dejan su resultado por escrito en `_progress/`.
4. Lanza el **revisor** (Sonnet, sin permisos de escritura, contexto limpio) → `PASS`/`NEEDS_WORK`.
5. Solo si `PASS`, cierra la unidad.

Punto didáctico: **tiering de modelos**. Workers en Haiku (mecánico), líder y revisor en Sonnet
(juicio), Opus reservado. El arnés lleva su presupuesto escrito en el frontmatter de cada agente.

---

## 5. Controles del operador (3 min)

> "El arnés no te quita el timón."

- **Parar en seco**: crea `_control/STOP` (el `kill-switch` bloquea todo). Bórralo para seguir.
- **Redirigir en caliente**: escribe en `_control/STEER.md`; el agente lo lee en el próximo turno.
- **Red de seguridad**: `_control/AUTOCOMMIT` activa el `commit-on-stop`.

---

## 6. Cierre: los tres pilares (2 min)

| Pilar | Dónde lo viste |
|---|---|
| El repo es el sistema | `AGENTS.md`, `_memory/`, todo en ficheros |
| Orquestación multiagente | `/procesar` → líder + workers + revisor |
| Verificación | `bin/check` + `verify-gate` + revisor (Default-FAIL) |

> "Menos es más (Vercel quitó el 80% de sus tools y fue 3,5× más rápido). El contexto se pudre,
> por eso la memoria vive en ficheros. Y la IA tiene que demostrar, no afirmar. Eso es harness
> engineering."

---

## Apéndice — reset de la demo

Si durante la demo se modificó el estado y quieres dejarlo limpio para la siguiente:

```bash
git switch v2
git checkout -- .          # descarta cambios no commiteados
git clean -fd _progress _control   # limpia ejecuciones y controles transitorios
```
