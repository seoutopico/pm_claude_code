#!/usr/bin/env bash
# .claude/hooks/steer.sh — Redireccion en caliente (UserPromptSubmit).
# Si _control/STEER.md tiene contenido, lo inyecta en el contexto del turno y lo vacia.

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cat >/dev/null 2>&1
STEER="$ROOT/_control/STEER.md"
if [ -s "$STEER" ] && grep -q '[^[:space:]]' "$STEER"; then
  echo "[STEER del operador] Hay una redireccion en _control/STEER.md. Tenla en cuenta AHORA antes de seguir:"
  cat "$STEER"
  echo "(El fichero se ha vaciado tras leerlo.)"
  : >"$STEER"
fi
exit 0
