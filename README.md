# claude.pm

> Sistema de gestión de proyectos en Claude Code. Markdown + memoria persistente + tu cerebro. Clónalo, lanza `/setup`, listo.

Por **[Aina Lluna](https://ainalluna.com)** · Newsletter: [ainalluna.substack.com](https://ainalluna.substack.com/)

Inspirado en el patrón **LLM Wiki** de [Andrej Karpathy](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f): el LLM no redescubre el contexto en cada sesión, lo acumula en una memoria que crece contigo.

---

## Rama `v2`: el arnés (harness)

Estás en la rama **`v2`**. Es el mismo sistema de la `main` (V1) pero envuelto en un **arnés**:
un protocolo de arranque que verifica salud (`bin/check`), una cola de trabajo explícita
(`_cola/trabajo.json`), orquestación multiagente (líder + workers + revisor) y un contrato
**Default-FAIL** que impide declarar algo "hecho" sin demostrarlo.

- **Empieza por** [`AGENTS.md`](AGENTS.md) (el punto de entrada) y [`DESIGN.md`](DESIGN.md) (el plano).
- **Guion de demo para clase**: [`docs/v2-arnes.md`](docs/v2-arnes.md).
- **Compara V1 vs V2**: `git diff main v2` muestra exactamente lo que añade el arnés.

---

## Qué es (y qué NO es)

**Es** un repositorio que clonas y conviertes en tu sistema personal de gestión de proyectos. Carpetas, plantillas, skills y agentes que viven en tu máquina y controlas al 100%.

**No es** un SaaS, no es un plugin opaco, no es otro kanban. No hay base de datos binaria, no hay servidores, no hay vendor lock-in.

## Instalación en 60 segundos

```bash
git clone https://github.com/seoutopico/claude.pm.git mi-sistema
cd mi-sistema
claude
```

Dentro de Claude Code:

```
/setup
```

El wizard te pregunta tu nombre y un primer proyecto, y dejas el sistema funcionando.

## Día a día

1. **Inbox**: durante el día tiras notas sueltas a `_inbox/_inbox.md`. Sin estructura, sin pensar.
2. **Procesar**: cuando quieras, lanzas `/ingesta`. Claude lee las notas, las clasifica y las distribuye al proyecto correspondiente, a memoria transversal, o a decisiones.
3. **Mirar**: por la mañana abres `STATUS.md`. Es tu dashboard.
4. **Nuevo proyecto**: `/nuevo nombre-del-proyecto`.
5. **Salud del sistema**: `/lint` busca contradicciones, páginas huérfanas y gaps.

## Estructura

```
.claude/           Skills, agents, slash commands. Editables.
_memory/           Memoria persistente: índice, log, gente, decisiones.
_inbox/            Notas sueltas pendientes de procesar.
_projects/         Tus proyectos. README + reuniones + decisiones + docs.
_templates/        Plantillas reutilizables. Personalízalas.
.obsidian/         Vault preconfigurado (plugin show-hidden-files activo).
docs/              Documentación del propio sistema.
STATUS.md          Dashboard rápido.
CLAUDE.md          Instrucciones que Claude lee cada sesión.
llms.txt           Índice navegable estándar.
```

## Filosofía

- **Tú mandas**: todo el comportamiento de Claude vive en `.claude/`. Borra, edita, añade.
- **Markdown puro**: nada binario. Diff legible en git, abrible en cualquier editor.
- **El LLM lleva el bookkeeping**: tú curas fuentes y haces preguntas. Él mantiene índice, log y referencias cruzadas.
- **Eficiente en tokens**: `llms.txt` y `CLAUDE.md` compactos por diseño. `_memory/_registry.json` da contexto rápido a los agentes sin escanear todo.

Más en [`docs/filosofia.md`](docs/filosofia.md).

## Personalización

Lee [`docs/personalizar.md`](docs/personalizar.md). Cómo crear nuevos skills, nuevos agentes, nuevos comandos, hooks opcionales, integraciones con tu calendario o tu Drive.

## Autora

Hecho por **[Aina Lluna](https://ainalluna.com)**.

Si te interesa la IA aplicada, la gestión de proyectos con LLMs y cómo construir sistemas personales sobre Claude Code, suscríbete a mi newsletter en **[ainalluna.substack.com](https://ainalluna.substack.com/)**.

Si este repo te resulta útil, una estrella en GitHub o un comentario por el canal que prefieras se agradece.

## Licencia

MIT. Ver [`LICENSE`](LICENSE).
