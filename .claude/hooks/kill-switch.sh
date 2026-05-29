#!/usr/bin/env bash
# .claude/hooks/kill-switch.sh — Parada de emergencia (PreToolUse, todas las tools).
# Si existe _control/STOP, bloquea CUALQUIER accion del agente (exit 2).
# El operador (humano) reanuda borrando el fichero _control/STOP.

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cat >/dev/null 2>&1
if [ -f "$ROOT/_control/STOP" ]; then
  echo "kill-switch: el operador ha activado _control/STOP. Acciones bloqueadas. Borra _control/STOP para reanudar." >&2
  exit 2
fi
exit 0
