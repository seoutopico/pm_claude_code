# Primer arranque

Tienes el repo clonado y abierto en Claude Code. Esto es lo que pasa en los próximos 5 minutos.

## 1. `/setup`

```
/setup
```

El wizard te hará **tres preguntas**:

1. **Nombre y rol** — ej. "Aina, PM en editorial".
2. **¿Algún proyecto inicial real?** — di un nombre, o "saltar" para quedarte sólo con el dummy de ejemplo.
3. **Cadencia de digest** — semanal, mensual o ninguno.

Tras tus respuestas, Claude rellena tu `CLAUDE.md`, crea el proyecto si pediste uno, y deja una entrada en `_memory/log.md`. Ya estás operativo.

## 2. Mira lo que ya viene incluido

Aunque saltes el setup, el repo viene con un proyecto de ejemplo completo (`_projects/example-product-launch/`) y la memoria del sistema poblada con datos coherentes. Abre estos archivos para entender el patrón:

- `STATUS.md` — tu dashboard.
- `_memory/index.md` — catálogo de todo.
- `_memory/log.md` — cómo se ve el changelog.
- `_projects/example-product-launch/README.md` — cómo se ve un proyecto.
- `_projects/example-product-launch/meetings/` — actas reales de ejemplo.
- `_projects/example-product-launch/decisions/001_eleccion-stack.md` — decisión local de proyecto.
- `_memory/decisions.md` — decisión transversal.

Cuando el ejemplo te canse, bórralo:
```bash
rm -rf _projects/example-product-launch
```
Y lanza `/status-refresh` para que el sistema lo asimile.

## 3. Día 1 con el sistema

### Mañana

Abre `STATUS.md`. Mira qué tienes activo, qué bloqueos hay, qué hitos están cerca.

### Durante el día

Apunta cosas sueltas en `_inbox/_inbox.md`. No te pares a pensar a qué proyecto pertenecen. Una línea por idea. Ejemplos:

```
Reunión con Marta el viernes 30/05 para hablar de pricing del proyecto X.
Decisión: usamos PostgreSQL.
Carlos ahora es sponsor del proyecto Y.
Pensar en cómo medir activación.
Cancelamos el proyecto Z.
```

### Cuando puedas

```
/ingesta
```

Claude lee el inbox, clasifica cada nota, te muestra el plan ("voy a poner esta nota aquí, esta otra allá"), distribuye, y deja el inbox vacío. Entrada nueva en `_memory/log.md`.

### Para un proyecto nuevo

```
/nuevo nombre-del-proyecto
```

Te crea la carpeta con su README, sus subcarpetas vacías, lo registra en memoria y lo añade a `STATUS.md`.

### Semanalmente

```
/digest
```

Resumen narrativo de la semana. Guardado en `_memory/digests/` y mostrado en pantalla. Listo para reenviar o leer.

```
/lint
```

Salud del sistema. Te dice si hay contradicciones, proyectos huérfanos, gaps, log desactualizado.

```
/status-refresh
```

Si has tocado READMEs a mano, esto resincroniza `STATUS.md` y el registry.

## 4. Personalización

Cuando el sistema base te quede pequeño, ve a [`personalizar.md`](personalizar.md). Cómo añadir skills nuevos, agentes, comandos, hooks opcionales, integraciones.

## 5. Si dudas

Lee [`filosofia.md`](filosofia.md) para entender por qué el repo está organizado así. Lee [`como-funciona-la-memoria.md`](como-funciona-la-memoria.md) para entender la lógica de `_memory/` (es lo menos obvio).

Cualquier otra cosa, pregunta a Claude. Tiene `CLAUDE.md` cargado en cada sesión y conoce el sistema.
