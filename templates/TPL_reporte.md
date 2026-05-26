---
period: {{period_label}}
period_number: {{N}}
date: {{ISO_DATE}}
cadence: {{cadence}}
author: {{owner.name}}
---

# Reporte {{period_label}} — {{ISO_DATE}}

## En cartera

{{count_active}} activos · {{count_new}} nuevos · {{count_closed}} cerrados · {{count_blocked}} bloqueados

## Resumen ejecutivo

{{Tres líneas máximo: qué se movió esta semana/mes, qué destacar.}}

## Cartera

| Proyecto | % | Δ | Estado | Última novedad |
|----------|---|---|--------|----------------|
{{rows}}

## Detalle por proyecto

{{Para cada proyecto activo: una sección con 2-4 líneas describiendo el avance del período. El subagente report-writer lee el README y el histórico de % para calcular Δ.}}

## Bloqueantes transversales

{{Lista de bloqueantes que afectan a más de un proyecto, o que requieren decisión externa.}}

## Próximo período

{{Qué se espera mover en el siguiente período.}}

---

_Reporte generado por `claude-pm` v0.1.0. Reglas de redacción: skill `{{rules_skill}}`._
