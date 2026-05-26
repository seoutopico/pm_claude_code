---
description: Genera el reporte periódico (semanal o mensual según config.report.cadence) sobre los proyectos activos.
---

Lanza la skill `reporte-periodico`.

La skill orquesta el subagente `report-writer` que lee STATUS.md, READMEs activos, histórico de porcentajes y genera el reporte siguiendo:

- La plantilla del vault: `{templates_root}/TPL_reporte.md`
- Las reglas del skill `reporte-periodico-rules` (genéricas por defecto, sobrescritas si el usuario tiene `.pm/skills/reporte-periodico-rules/SKILL.md`)

Por defecto se genera el reporte del período actual (semana ISO o mes en curso, según cadencia). Si el usuario pasa un período concreto en el comando (ej. `/pm:reporte semana 21` o `/pm:reporte mayo 2026`), genera ese período concreto.

Si `config.features.periodic_report` es `false` o no existe la sección `config.report`, avisa al usuario qué debe configurar.
