# Alcance del MVP — `example-product-launch`

- **Versión**: 1.0
- **Última actualización**: 2026-05-22
- **Owner**: Marta García

## Objetivo del MVP

Validar la propuesta de valor del producto X con un grupo piloto de 30 usuarios durante 4 semanas, midiendo activación, retención semana 2 y disposición a pagar.

## Qué entra en la v1

- **Onboarding básico**: registro por email, verificación, primer estado configurado.
- **Funcionalidad core**: crear, listar y actualizar items del recurso principal.
- **Pricing**: dos planes (gratuito limitado, premium con un único tier).
- **Métricas**: tracking de eventos clave (registro, activación, uso semanal).
- **Soporte**: formulario de contacto que cae en un buzón compartido.

## Qué NO entra en la v1

- Integraciones con sistemas externos.
- App móvil nativa (sólo web responsiva).
- Equipos multiusuario o roles.
- Internacionalización (sólo español).
- Facturación recurrente automática (los 30 usuarios piloto entran gratis).

## Criterios de éxito de la beta

| Métrica | Objetivo |
|---|---|
| Usuarios activados (completan onboarding) | 70% de los registrados |
| Retención semana 2 | 50% |
| NPS al final del piloto | ≥ 30 |
| Bugs críticos en producción | 0 |

## Riesgos conocidos

- **Legal**: pendiente revisión de privacy y términos antes de abrir la beta. Bloqueo activo (ver README).
- **Curva TS**: equipo aprendiendo TypeScript (ver D-001). No impacta plazo pero sí velocidad inicial.

## Cronograma resumido

- 15/05 — Kickoff
- 22/05 — Stack confirmado y scope cerrado
- 05/06 — Revisión seguridad
- 12/06 — Beta cerrada lanzada
- 10/07 — Cierre del piloto y decisión sobre lanzamiento abierto
