---
name: reporte-periodico
description: Genera el reporte periódico (semanal o mensual, según config) sobre los proyectos activos. Orquesta el subagente report-writer.
context: fork
agent: general-purpose
disable-model-invocation: true
---

# Reporte periódico

Orquestador del subagente **`report-writer`**. Genera el reporte de la cadencia configurada en el vault (`config.report.cadence`) y lo guarda según `config.report.output_pattern`.

## Precondiciones

- `.pm/config.json` existe y tiene la sección `report` definida.
- `config.features.periodic_report` es `true`.

Si alguna de las dos no se cumple, di al usuario qué falta y termina.

## Paso 1 — Lanzar report-writer

Lanza el subagente **`report-writer`** con la instrucción:

> Genera el reporte del período actual leyendo `.pm/config.json` para conocer cadencia, paths, plantillas y reglas. Aplica las reglas del skill `reporte-periodico-rules` que tienes precargado. Guarda el reporte en la ruta resuelta de `output_pattern` y actualiza `history_file`.

Si el usuario indica explícitamente "regenera el reporte de la semana X" o similar, pasa esa instrucción al subagente para que use ese período en lugar del actual.

Espera a que termine.

## Paso 2 — Presentar el resultado

Muestra al usuario:

1. Ruta del archivo generado
2. Las primeras 20-30 líneas del reporte como preview
3. Avisos del subagente (proyectos sin datos, entradas reescritas en el histórico, etc.)
4. Sugerencia: "Revisa el archivo. Si quieres cambios concretos (tono, longitud, qué incluir), edita el skill `reporte-periodico-rules` en tu vault y vuelve a lanzar `/pm:reporte`."

## Reglas

- NO modifiques el reporte tras la ejecución del subagente, salvo que el usuario lo pida explícitamente.
- Si `config.validation.on_subagent_stop` incluye `report-writer`, el hook `validate-report` se ejecutará automáticamente al terminar el subagente. Si falla (exit 2), el subagente recibirá los errores y deberá corregir antes de terminar.
- Idioma según `config.language`.
