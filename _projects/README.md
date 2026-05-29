# Proyectos

Esta carpeta contiene un directorio por cada proyecto activo. Cada proyecto tiene su propia estructura:

```
_projects/<id>/
├── README.md         Fuente de verdad: estado, alcance, hitos, histórico.
├── meetings/         Actas de reunión (<YYYY-MM-DD>_<slug>.md).
├── decisions/        Decisiones específicas del proyecto (<NNN>_<slug>.md).
└── docs/             Briefs, especificaciones, material de referencia.
```

## Crear un proyecto nuevo

```
/nuevo nombre-del-proyecto
```

Esto crea la estructura completa, registra el proyecto en `_memory/projects.md` y en `_memory/_registry.json`, y deja una entrada en `_memory/log.md`.

## Proyectos archivados

Los proyectos cancelados o completados **no se borran**. Se mueven a `_projects/_archive/<id>/`. Su histórico queda preservado para consultas futuras y para `/digest`.

## Ejemplo incluido

`example-product-launch/` viene con el repo como muestra completa. Borrarlo o conservarlo es opción tuya. Si lo borras, recuerda lanzar `/status-refresh` para que `STATUS.md` y `_memory/` se actualicen.

## Reglas

- **Un proyecto = una carpeta con ID slug-case**. Sin espacios, sin acentos, en minúsculas.
- **`_projects/` es PLANO: no lo organices por subcarpetas de tipo.** Una carpeta directa = un proyecto = un `id`. El tipo (código, formación, ponencia, colaboración) es un **campo `Tipo:`** en el README, no una carpeta. Anidar por tipo rompe `bin/check` y `status-syncer`. (Invariante completo en `AGENTS.md`.)
- **El ID es inmutable**. Cambiar el nombre de la carpeta es operación manual, requiere actualizar `_memory/` y `STATUS.md` a mano.
- **El README es la fuente de verdad**. Si lo editas a mano, lanza `/status-refresh` para resincronizar el dashboard.
