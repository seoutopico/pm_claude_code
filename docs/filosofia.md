# Filosofía

> Por qué este repo está hecho así, y no de otra manera.

## El problema

Gestionar proyectos como PM individual es bookkeeping puro. Notas en mil sitios, decisiones que se olvidan, reuniones que pasan sin huella, estado mental fragmentado entre herramientas.

Las soluciones habituales:
- **Notion / Linear / Asana**: potentes, opacos, pago por usuario, lock-in.
- **Tu carpeta de Drive con READMEs**: barato, libre, pero sin disciplina se vuelve un desastre.
- **Otro plugin de PM**: añade superficie sin resolver el problema de fondo.

Este repo intenta otra cosa.

## Principios

### 1. Tú mandas

Todo el comportamiento de Claude vive en `.claude/`. Skills, agentes, comandos. Los abres con cualquier editor, los lees, los modificas, los borras.

Esto es la diferencia frente a un plugin opaco. Un plugin te impone su lógica. Aquí, **tú eres dueño de la lógica desde el minuto cero**.

### 2. Markdown puro

Nada binario. Nada de bases de datos. Nada que requiera dependencias.

- Cualquier editor abre cualquier archivo.
- `git diff` muestra cambios legibles.
- Si se rompe Claude Code mañana, sigues teniendo un sistema usable.
- Si te llevas la carpeta a otra herramienta (Obsidian, VS Code, lo que sea), funciona igual.

### 3. El LLM lleva el bookkeeping, tú la dirección

Inspirado en [Karpathy](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

Lo tedioso de mantener un sistema de PM no es leer ni pensar. Es **mantener referencias cruzadas, actualizar índices, registrar cambios consistentemente**. Los humanos se cansan. El LLM no.

Tu trabajo: curar fuentes, dirigir, decidir, preguntar.
El LLM: ingest, query, lint. Bookkeeping.

### 4. Eficiente en tokens

Cada archivo que Claude lee en cada sesión cuenta. Por eso:

- `CLAUDE.md` se mantiene en 100-150 líneas, no 1000.
- `llms.txt` da un mapa rápido del repo en menos de 80 líneas.
- `_memory/_registry.json` da contexto estructurado de los proyectos en una sola lectura.
- Los markdowns largos (READMEs de proyecto) se leen **solo cuando es relevante**, no por defecto.

### 5. Append-only para la causalidad

`_memory/log.md` nunca se edita. Solo se añade al final.

Esto preserva **el porqué**. Saber que el proyecto X está cancelado es menos útil que saber por qué se canceló y cuándo. El log convierte una foto en una película.

### 6. Sin nombres propios en el core

Lo que viene de fábrica es **universal**. No hay nada que diga "Aina" o "Editorial Planeta" o "PowerPoint mensual para JAT". El proyecto dummy se llama `example-product-launch` y los stakeholders son nombres genéricos.

Cuando personalices, lo haces tú. El repo no te obliga a parecerte a quien lo construyó.

### 7. Plantillas, no magia

Toda creación parte de una plantilla en `_templates/`. No hay generación procedural opaca. Si una plantilla no te gusta, la editas y todo lo que se cree a partir de ahí seguirá tu versión.

### 8. No sobre-ingenieres

Lo que no está aquí, y por qué:

- **No hay JSON schemas validables**. Si un README está mal formado, el linter lo señala, pero el sistema no peta.
- **No hay base de datos**. Markdown lo aguanta.
- **No hay tests**. Cada usuario tiene su sistema, los tests serían contra una versión muerta.
- **No hay hooks por defecto**. Cross-platform es un agujero negro.
- **No hay scripts Python/Node en el core**. Si los necesitas, los añades en tu repo personal.

## Anti-principios (lo que evito)

- **"Una solución para todo"** — este repo hace una cosa: gestionar proyectos personales con memoria persistente. No hace gestión de equipos, no hace ticketing, no hace facturación.
- **"Listo para usar fuera de la caja"** — sí lo está, pero el valor real aparece cuando lo modificas a tu flujo. Un sistema PM perfecto es siempre algo personal.
- **"Cada vez más features"** — el sistema gana valor por **acumulación de tu historia dentro de él**, no por añadir capacidades nuevas al motor.

## Inspiraciones

- **[LLM Wiki — Andrej Karpathy](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** — el patrón de tres capas y las tres operaciones.
- **[llms.txt — Jeremy Howard / Answer.AI](https://llmstxt.org/)** — el estándar de indexar repos para LLMs.
- **Claude Code memory docs** — la convención de `CLAUDE.md` como schema.
- **Sistemas personales tipo Zettelkasten / Obsidian** — la idea de que markdown + referencias cruzadas es suficiente para casi todo.

## Resumen en una página

> **Markdown puro + memoria persistente + skills editables + tú al volante.** Inspirado en Karpathy, optimizado para tokens, sin opacidad, sin lock-in. Lo bastante simple para que lo entiendas en una tarde, lo bastante completo para que dure años.
