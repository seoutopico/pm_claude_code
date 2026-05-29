# DESIGN.md — claude.pm **V2**: el mismo sistema, ahora con arnés

> Estado: **borrador para revisar juntos**. La base (rama `v2`) está creada; el arnés aún no.
> Este documento es el plano. Construimos por fases (ver §10).

---

## 0. Modelo de versiones: ramas, no carpetas

La **V1** es un sistema de gestión de proyectos en markdown donde **tú diriges cada paso**.
La **V2** es *exactamente el mismo sistema*, pero envuelto en un **arnés** (harness): un
**líder** que orquesta subagentes, un **protocolo de arranque** que verifica salud antes de
tocar nada, y un **contrato de verificación** que impide declarar algo "hecho" sin demostrarlo.
El cerebro (el modelo) es intercambiable; el arnés se queda.

Las dos versiones viven en **ramas git**:

```
main   ← V1: la base estable (tag v1.0). NO se toca.
  └── v2   ← este arnés, construido ENCIMA de la V1, modificando en el sitio.
```

**La ventaja didáctica del modelo de ramas:** `git diff main v2` muestra *exactamente lo que
el arnés añade* — el mejor material posible para enseñar "antes vs después". En clase:
`git switch main` para el antes, `git switch v2` para el después.

Lo único que se pierde frente a las carpetas es ver ambas a la vez en disco; lo compensa la
limpieza del diff y que la V2 evoluciona la V1 en lugar de duplicarla.

---

## 1. Qué NO cambia (la filosofía de la repo es sagrada)

La V2 hereda y respeta, sin excepción, los principios de la V1:

1. **El repositorio es el sistema.** Todo vive en ficheros del repo, no en un chat.
2. **Markdown primero, cero dependencias.** Nada de Node/Python para tareas que resuelve el
   markdown. Los únicos scripts nuevos son la "fontanería" del arnés (verificación), en POSIX
   shell / PowerShell sin librerías externas.
3. **Nunca se borra.** Lo cancelado/terminado se archiva en `_projects/_archive/`.
4. **El log es append-only.** Si te equivocaste, rectificas con una entrada nueva.
5. **Antes de inventar, busca.** Se lee `_registry.json` y los README; no se tira de memoria
   del chat.
6. **Las plantillas mandan.** Lo nuevo se crea desde `_templates/`.
7. **Tú curas y diriges; el sistema lleva el bookkeeping.** El arnés no te quita el timón: te
   quita el trabajo mecánico y te da garantías de que se hizo bien.

Lo que la V2 **añade** son los pilares 2 y 3 del harness engineering, que a la V1 le faltan.

---

## 2. Los tres pilares aplicados a este repo

| Pilar | Qué es | Cómo lo hace la V2 |
|---|---|---|
| **1. El repo es el sistema** | El arnés vive en los ficheros | Ya lo cumple la V1: `CLAUDE.md`/`AGENTS.md` (entrada), `_memory/` (memoria), skills (herramientas), `_templates/` (estructura) |
| **2. Orquestación multiagente** | Líder reparte, workers ejecutan, cada uno con contexto limpio | Un agente **líder** enruta a los subagentes existentes y luego al **revisor** |
| **3. Verificación** | El trabajo se demuestra, no se afirma | **Contrato Default-FAIL** + script de salud (`check`) + revisor con contexto limpio + hook que bloquea el "hecho" sin evidencia |

---

## 3. La traducción clave: arnés de *código* → arnés de *bookkeeping*

El arnés de referencia de Anthropic es para **escribir software**: su verificación son *tests
verdes* y *un navegador con Puppeteer*. Este repo **no escribe código, lleva la contabilidad
de proyectos**. La gracia de la V2 es traducir el patrón a nuestro dominio. El mapeo es casi 1:1:

| Concepto del arnés (mundo código) | Equivalente en la V2 (mundo PM) |
|---|---|
| `init.sh` (¿compila?, ¿tests verdes?) | `bin/check` → ¿`_registry.json` coherente con los README?, ¿sin huérfanos?, ¿`log.md` intacto y append-only? |
| `feature_list.json` (`passes:false`) | `_cola/trabajo.json` → unidades de trabajo (notas del inbox, tareas) con `done:false` |
| "test pasa" = feature hecha | **invariante de las 3 escrituras**: README del proyecto + entrada en `log.md` + `STATUS.md` actualizado = tarea hecha |
| evidencia (screenshots, logs) | los **diffs reales** de los ficheros tocados + salida de `/lint` en verde |
| `evaluator` (PASS / NEEDS_WORK) | **revisor** que corre `check`/`lint` sobre el cambio antes de declararlo hecho |
| orquestador + workers | **líder** que enruta a los subagentes que ya existen en V1 |
| `claude-progress.txt` | `_progress/actual.md` + `_progress/history.md` |
| `commit-on-stop` hook | igual, + entrada automática en `log.md` |

**Regla de oro del harness** (Anthropic): *si una información está disponible para el humano
pero no para el agente, el arnés tiene un agujero*. La V2 cierra los agujeros de la V1: hoy el
"definir hecho" vive en tu cabeza (regla operativa nº1 del CLAUDE.md); en la V2 vive en el
`check` y en el revisor.

---

## 4. Estructura en la rama `v2`

Todo en la raíz, **sobre la base de la V1**. `[nuevo]` = lo añade el arnés; `[hereda]` = viene
de la V1 intacto; `[modifica]` = fichero de V1 que el arnés ajusta.

```
(rama v2)
├── AGENTS.md                    [nuevo]    PUNTO DE ENTRADA: protocolo + mapa del repo + reglas
├── CLAUDE.md                    [modifica] puntero corto a AGENTS.md (Claude Code lo lee solo)
├── DESIGN.md                    [nuevo]    este documento
│
├── bin/
│   ├── check.sh                 [nuevo]    EL "INIT": gate de salud. Verifica invariantes. Exit 0/1.
│   └── check.ps1                [nuevo]    gemelo PowerShell (el usuario está en Windows)
│
├── .claude/
│   ├── settings.json            [modifica] registra hooks y permisos del arnés
│   ├── agents/
│   │   ├── lider.md             [nuevo]    ORQUESTADOR: lee cola, decide, spawnea, cierra
│   │   ├── revisor.md           [nuevo]    EVALUADOR: PASS/NEEDS_WORK. SIN Write/Edit.
│   │   ├── inbox-classifier.md  [hereda]   worker: clasifica notas del inbox
│   │   ├── project-updater.md   [hereda]   worker: actualiza un proyecto
│   │   ├── status-syncer.md     [hereda]   worker: regenera STATUS + registry
│   │   └── wiki-maintainer.md   [hereda]   worker: mantiene _memory/
│   ├── hooks/
│   │   ├── verify-gate.sh/.ps1  [nuevo]    PreToolUse: prohíbe marcar done sin que check pase
│   │   ├── commit-on-stop.sh/.ps1 [nuevo]  Stop: deja constancia (log.md) + commit opcional
│   │   └── steer.sh/.ps1        [nuevo]    lee _control/STEER.md para redirigir en caliente
│   ├── skills/                  [hereda]   /ingesta, /lint, /nuevo, /digest, /status-refresh
│   └── commands/                [hereda]   los slash commands de V1
│
├── _cola/
│   └── trabajo.json             [nuevo]    la "feature_list" del PM: unidades con done:false
│
├── _progress/
│   ├── actual.md                [nuevo]    la ejecución EN CURSO (se limpia al cerrar)
│   ├── history.md               [nuevo]    changelog append-only de ejecuciones
│   └── <run-id>/                [nuevo]    resultados que cada worker deja por escrito
│
├── _control/                    [nuevo]    controles del operador (tú)
│   ├── STOP                     [nuevo]    si existe → el kill-switch para al agente
│   └── STEER.md                 [nuevo]    si tiene contenido → redirige al líder sin reiniciar
│
│  ── heredado de V1, el dominio PM no cambia ──
├── _inbox/_inbox.md             [hereda]
├── _projects/<id>/README.md     [hereda]   (arranca con example-product-launch)
├── _memory/{index,log,projects,people,decisions}.md + _registry.json   [hereda]
├── _templates/                  [hereda]
├── STATUS.md                    [hereda]
└── llms.txt                     [hereda]
```

---

## 5. Los agentes (rol, contexto, contrato)

Principio (Vercel + Anthropic): **pocas herramientas, contexto limpio**. Cada subagente recibe
una tarea autocontenida, NO hereda el contexto del líder, y **escribe su resultado en
`_progress/<run-id>/`** para que el siguiente no tenga que releer nada.

### 5.1 `lider.md` — el orquestador  [nuevo]
- **Lee** (no ejecuta trabajo pesado): `AGENTS.md`, `_progress/actual.md`, `_cola/trabajo.json`,
  `_registry.json`.
- **Decide**: ¿esta unidad necesita clasificar?, ¿actualizar un proyecto?, ¿resincronizar el
  dashboard? ¿Uno o varios workers? ¿En serie o en paralelo?
- **Spawnea** los workers con instrucción explícita: *"escribe tu resultado en
  `_progress/<run-id>/<nombre>.md`"*.
- **Cierra**: cuando los workers terminan, lanza el `revisor`. Si `PASS`, actualiza
  `history.md`, limpia `actual.md` y marca la unidad `done:true`. Si `NEEDS_WORK`, reinyecta
  los hallazgos como prompt del siguiente intento.
- **NO** marca nada como hecho por su cuenta: el contrato Default-FAIL se lo impide (§6).

### 5.2 Workers — los subagentes de V1, reutilizados tal cual  [hereda]
- `inbox-classifier`: lee una nota, decide destino (proyecto/persona/decisión).
- `project-updater`: aplica el cambio al `README.md` del proyecto.
- `status-syncer`: regenera `STATUS.md` y `_registry.json` desde los README.
- `wiki-maintainer`: mantiene `_memory/`.
- No los reescribimos (menos es más): el líder los invoca como herramientas. Solo les añadimos
  la regla "deja tu resultado por escrito en `_progress/`".

### 5.3 `revisor.md` — el evaluador (la pieza nueva más importante)  [nuevo]
- **Contexto limpio**: nunca vio cómo se construyó el cambio. Solo ve el resultado.
- **SIN permisos de Write/Edit**: solo lee y juzga.
- **Comprueba el invariante de las 3 escrituras** y corre `check`/`lint`.
- Devuelve **`PASS`** o **`NEEDS_WORK` + hallazgos concretos**.
- **Puede automejorarse**: si detecta un patrón de fallo recurrente, puede proponer editar su
  propio `.md` o el `AGENTS.md` (pilar 3: el arnés se corrige a sí mismo).

### 5.4 Qué modelo usa cada agente (optimización de tokens)

El modelo es el **cerebro intercambiable** del arnés. Cada agente declara el suyo en el
frontmatter de su `.md` (`model: haiku | sonnet | opus`), así que el arnés **lleva escrito su
propio presupuesto** y cambiar de cerebro es editar un campo.

Principio: **cerebro barato para trabajo mecánico/determinista; cerebro caro solo donde hay
juicio (orquestar y verificar).**

| Agente | Modelo | Por qué |
|---|---|---|
| `lider` | **Sonnet** | Enrutado = juicio acotado. Opus opt-in si la petición es compleja. |
| `inbox-classifier` | **Haiku** | Encajar una nota en su destino es pattern-matching. Escala a Sonnet si es ambigua. |
| `project-updater` | **Haiku** | Aplicar un cambio siguiendo plantilla: estructurado. |
| `status-syncer` | **Haiku** | Transformación determinista (README → STATUS/registry). El más repetitivo → el más barato. |
| `wiki-maintainer` | **Haiku** | Mantenimiento estructurado de `_memory/`. |
| `revisor` | **Sonnet** | **No se abarata.** Sostiene el Default-FAIL; un verificador débil rompe el arnés. Opus en cambios críticos. |

Perfil de coste: el grueso del volumen (workers) en **Haiku**, los dos puntos de juicio (líder,
revisor) en **Sonnet**, **Opus reservado**. Refleja el hallazgo de Anthropic (orquestador
potente + workers más baratos, +90% rendimiento) pero, como aquí el dominio es *bookkeeping
determinista* y no *investigación abierta*, bajamos los workers a Haiku donde ellos usaron Sonnet.

**Las otras tres palancas de tokens** (el arnés ya las aplica por diseño, independientes del modelo):

1. **Contexto aislado** — los workers no heredan el contexto del líder. Contexto limpio = pocos
   tokens de entrada. Un Haiku con contexto mínimo cuesta casi nada.
2. **Memoria externa** — el estado vive en `_memory/` y `_progress/`, no en la ventana. Evita el
   *context rot* (degradación ~20%, limpiar ~40%) y ahorra tokens a la vez.
3. **Pocas herramientas** — lección de Vercel `d0`: menos tools = 37% menos tokens. Cada worker
   recibe solo las herramientas que su tarea necesita.

> **Escalado opcional (avanzado, Fase 3+):** un worker empieza en Haiku y, si reporta baja
> confianza, el líder reintenta en Sonnet. "Barato por defecto, caro bajo demanda."

---

## 6. El contrato **Default-FAIL** (corazón del pilar 3)

> Nada se marca como `done:true` hasta que se **demuestra**. Por defecto, todo está sin hacer.

1. Una unidad de `_cola/trabajo.json` empieza siempre en `done:false`.
2. Para pasarla a `done:true` deben cumplirse **las tres escrituras** (README + log + STATUS)
   **y** `bin/check` debe salir con código 0.
3. El hook **`verify-gate`** (evento `PreToolUse`) intercepta cualquier intento de editar
   `trabajo.json` para poner `done:true`: si `check` no ha pasado en esta sesión, **deniega**
   la escritura. (Equivalente exacto al hook de Anthropic que prohíbe marcar `passes` sin
   evidencia.)

Esto convierte tu **regla operativa nº1** ("refleja el cambio en tres sitios") de *buena
intención* a *invariante que el sistema hace cumplir*.

---

## 7. El script de salud: `bin/check`

El equivalente PM del `init.sh`. Determinista, sin dependencias externas (solo shell + grep, al
estilo del `grep -q '"passes": false'` de Anthropic). Verifica:

- [ ] Existen `AGENTS.md`, `_cola/trabajo.json`, `_memory/_registry.json`.
- [ ] Cada proyecto en `_registry.json` tiene su `_projects/<id>/README.md` (y sin huérfanos).
- [ ] `_memory/log.md` no ha perdido entradas respecto al último commit (append-only intacto).
- [ ] El formato de `trabajo.json` es válido y toda unidad tiene estado.
- [ ] `STATUS.md` existe y su fecha no es anterior al último cambio registrado.

Salida: **exit 0** = "sano, puedes trabajar"; **exit 1** = "para, algo está roto" (y dice qué).
Se ejecuta: (a) al arrancar la sesión, (b) en el `verify-gate`, (c) como hook opcional al cerrar.

---

## 8. El protocolo de sesión (lo que dirá `AGENTS.md`)

```
1. Ejecuta bin/check.          → si falla, PARA y reporta. No trabajes sobre un sistema roto.
2. Lee _progress/actual.md.    → ¿quedó algo a medias en la última sesión?
3. Lee _cola/trabajo.json.     → coge UNA unidad con done:false (una sola, no multitarea).
4. El líder decide qué workers lanzar y los spawnea (contexto limpio, resultado por escrito).
5. Los workers ejecutan y escriben en _progress/<run-id>/.
6. El líder lanza el revisor (contexto limpio, sin escritura).
7. ¿PASS? → aplica las 3 escrituras, marca done:true (pasando el verify-gate), append a
   history.md, limpia actual.md.   ¿NEEDS_WORK? → reinyecta hallazgos y vuelve al paso 4.
8. commit-on-stop deja constancia.
```

**Mapa del repo en `AGENTS.md`**: para que los agentes no relean todo (y se les inunde el
contexto), `AGENTS.md` incluirá una tabla "dónde está cada cosa" — la que ya tienes en tu
CLAUDE.md actual, que es oro para esto.

---

## 9. Controles del operador (tú no pierdes el timón)

- **Kill-switch**: crear `_control/STOP` → el siguiente tool call se bloquea. Paras en seco.
- **Steer**: escribir en `_control/STEER.md` → el líder lo lee una vez y se reorienta sin
  reiniciar.
- **El inbox sigue siendo tuyo**: el arnés nunca escribe en `_inbox/`. Tú curas, él procesa.

---

## 10. Plan de construcción por fases ("de menos a más")

- **Fase 0 — Ramas.** ✅ `main` = V1 (tag `v1.0`); rama `v2` creada. *(hecho)*
- **Fase 1 — Pilar 1+3 (la base).** `AGENTS.md` + `bin/check` (.sh/.ps1) + `_cola/trabajo.json`
  + contrato Default-FAIL con `verify-gate`. Demo: arrancar, que `check` mande, que NO te deje
  marcar hecho sin las 3 escrituras.
- **Fase 2 — Pilar 2 (orquestación).** `lider.md` + `revisor.md` + adaptar los workers + sistema
  `_progress/`. Demo: una nota del inbox procesada de punta a punta por el líder.
- **Fase 3 — Fontanería fina.** Hooks `commit-on-stop` y `steer`, kill-switch, y automejora del
  revisor. Demo: redirigir en caliente y parar en seco.
- **Fase 4 — Pulido para clase.** Guion de demo "V1 vs V2" (`git diff main v2`), diagrama de los
  tres pilares, actualizar README de la rama v2.

---

## 11. Decisiones cerradas

| Decisión | Elegido |
|---|---|
| Versionado | **Ramas** (`main`=V1 + `v2`), tag `v1.0`. *(antes carpetas; cambiado a ramas)* |
| Scripts | `.sh` + gemelos `.ps1` |
| Cola | `trabajo.json` |
| Datos de la V2 | solo `example-product-launch` |
| Modelos | líder/revisor **Sonnet**, workers **Haiku**, Opus reservado |
| Skills de V1 | reusar como herramientas del líder, no duplicar |

---

## 12. Fuentes

- Anthropic — *Effective harnesses for long-running agents* y repo `anthropics/cwc-long-running-agents`
- Anthropic — *Effective context engineering for AI agents* y *How we built our multi-agent research system*
- Vercel — *We removed 80% of our agent's tools* (caso `d0`: 3,5× más rápido, 37% menos tokens)
- Las dos transcripciones de YouTube aportadas por el usuario (harness engineering; anatomía de un agente / ReAct)
