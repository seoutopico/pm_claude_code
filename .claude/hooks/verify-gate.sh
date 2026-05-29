#!/usr/bin/env bash
# .claude/hooks/verify-gate.sh — Contrato Default-FAIL (PreToolUse), version POSIX.
# Si se intenta escribir "done": true en _cola/trabajo.json y bin/check NO pasa,
# bloquea la escritura (exit 2). En cualquier otro caso, permite (exit 0).

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
payload="$(cat)"

echo "$payload" | grep -q 'trabajo\.json' || exit 0
echo "$payload" | grep -Eq '"done"[[:space:]]*:[[:space:]]*true' || exit 0

if ! "$ROOT/bin/check.sh" >/dev/null 2>&1; then
  echo "verify-gate (Default-FAIL): BLOQUEADO. Intentas marcar done:true pero bin/check ha fallado. Ejecuta bin/check.sh, arregla lo que reporte (huerfanos, log append-only, etc.) y reintenta." >&2
  exit 2
fi
exit 0
