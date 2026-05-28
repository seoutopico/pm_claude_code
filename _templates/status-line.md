# Línea de STATUS.md

> Una fila de la tabla principal de `STATUS.md`. Se usa cuando el agente `status-syncer` regenera el dashboard.

## Formato

```
| `{{ID}}` | {{Nombre humano}} | {{Estado}} | {{Próximo hito (YYYY-MM-DD)}} | {{Bloqueos o "-"}} | {{Actualizado YYYY-MM-DD}} |
```

## Valores válidos para "Estado"

- `En curso` — trabajo activo, hay movimiento.
- `Bloqueado` — esperando algo externo. Debe haber al menos un bloqueo en la columna.
- `En revisión` — entregado, esperando aprobación.
- `Pausado` — congelado por decisión, no por bloqueo. Sin fecha clara de retomar.
- `Cancelado` — terminado sin completar. Mover a `_projects/_archive/`.
- `Completado` — terminado con éxito. Mover a `_projects/_archive/`.

## Ejemplo

```
| `lanzamiento-producto-x` | Lanzamiento producto X | En curso | 2026-06-12 (Beta cerrada) | Pendiente OK legal | 2026-05-22 |
```
