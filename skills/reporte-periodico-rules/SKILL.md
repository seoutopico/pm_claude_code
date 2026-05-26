---
name: reporte-periodico-rules
description: Reglas de redacción del reporte periódico. Pensado para preload en el subagente report-writer. El usuario puede sobreescribir esta skill colocando una versión propia en .pm/skills/reporte-periodico-rules/SKILL.md con sus reglas específicas (audiencia, tono, secciones, palabras prohibidas, etc.).
user-invocable: false
---

# Reglas del reporte periódico (genéricas)

Estas son las reglas **por defecto** del plugin `pm`. Son intencionalmente neutras y mínimas para servir a cualquier organización. **El usuario debe sobreescribir este skill** con sus reglas reales colocando un archivo en `.pm/skills/reporte-periodico-rules/SKILL.md` que herede o reemplace esta estructura.

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

## Cómo sobreescribir estas reglas

Para que tu reporte tenga TUS reglas (audiencia concreta, tono específico, secciones obligatorias, palabras prohibidas, datos fijos como cabecera/firma, etc.):

1. Crea `.pm/skills/reporte-periodico-rules/SKILL.md` en tu vault.
2. Mantén el frontmatter `name: reporte-periodico-rules` y `user-invocable: false` (importante, así no se invoca por accidente).
3. Reemplaza el cuerpo con tus reglas. Puede ser tan extenso como quieras.
4. El subagente `report-writer` lo cargará automáticamente porque está declarado en su `skills:` preload.

Ejemplo de override avanzado: ver `docs/EXTENDING.md` (caso "reporte con audiencia directiva no técnica").
