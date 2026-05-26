---
name: reporte-periodico-rules
description: Reglas de redacción del reporte periódico. Preload del subagente report-writer. Reglas neutras pensadas para funcionar con cualquier organización; ajustables editando esta skill o sobrescribiéndola en .pm/skills/reporte-periodico-rules/SKILL.md.
user-invocable: false
---

# Reglas del reporte periódico

Reglas por defecto del plugin `pm`. Neutras y mínimas para servir a cualquier organización. Funcionan bien tal cual; si quieres reglas más opinionadas para tu audiencia concreta (directiva no técnica, equipo técnico, cliente externo, etc.), edita este archivo o coloca una versión propia en `.pm/skills/reporte-periodico-rules/SKILL.md` del vault.

## 5 reglas mínimas

1. **Es un reporte, no un dashboard.** Texto plano. Tablas solo cuando aportan (no por estética).
2. **Tono directo, sin florituras.** Frases cortas. Voz activa. No "se ha procedido a iniciar", sí "iniciado".
3. **Fechas siempre ISO `YYYY-MM-DD`.** El público entiende formatos locales por contexto.
4. **No inventes datos.** Si un proyecto no tiene `progreso` claro, escribe `?`. Si una novedad no se desprende del README, no la inventes — usa "Sin novedad en este período".
5. **Idioma según `config.language`.** Si `language_strict: true`, respeta diacríticos del idioma.

## Estructura por defecto

La plantilla del vault (`{templates_root}/TPL_reporte.md`) define la estructura visual. El report-writer rellena las secciones:

- **En cartera** (contadores: activos / nuevos / cerrados / bloqueados)
- **Resumen ejecutivo** (3 líneas máx.)
- **Cartera** (tabla: Proyecto, %, Δ, Estado, Última novedad)
- **Detalle por proyecto** (2-4 líneas por proyecto activo)
- **Bloqueantes transversales** (solo si los hay)
- **Próximo período** (qué se espera mover)

Si la plantilla del usuario omite o reordena secciones, **respeta la plantilla** del vault (es la fuente de verdad sobre el formato).

## Lo que NO incluir nunca

- Datos sensibles (presupuestos, salarios, info personal de clientes/empleados) salvo que el frontmatter del README los marque como `public: true`.
- Información que no se desprende directamente de los READMEs o del histórico.
- Opiniones, valoraciones subjetivas, recomendaciones (a menos que el reglamento del usuario las pida explícitamente).
- Emojis o iconos (a menos que el usuario los habilite explícitamente).

## Personalización (opcional)

Si quieres reglas más específicas para tu audiencia (palabras prohibidas, datos fijos como cabecera/firma, longitud máxima, secciones obligatorias), tienes dos vías:

1. **Editar este archivo directamente** (en `<plugin>/skills/reporte-periodico-rules/SKILL.md`). Tus cambios se pierden si reinstalas el plugin desde marketplace.
2. **Colocar tu versión en el vault**: crea `.pm/skills/reporte-periodico-rules/SKILL.md` con tus reglas. El subagente `report-writer` la carga automáticamente y tiene preferencia sobre la del plugin. Sobrevive a actualizaciones.

Mantén el frontmatter `name: reporte-periodico-rules` y `user-invocable: false` en cualquier caso.
