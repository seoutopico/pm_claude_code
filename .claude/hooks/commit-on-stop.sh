#!/usr/bin/env bash
# .claude/hooks/commit-on-stop.sh — Red de seguridad al cerrar (Stop).
# Por defecto NO commitea. Solo auto-commitea si existe el flag _control/AUTOCOMMIT.

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cat >/dev/null 2>&1
cd "$ROOT" || exit 0

[ -z "$(git status --porcelain)" ] && exit 0

if [ -f "$ROOT/_control/AUTOCOMMIT" ]; then
  git add -A
  git commit -m "arnes: commit automatico al cerrar sesion (AUTOCOMMIT activo)" >/dev/null 2>&1
fi
exit 0
