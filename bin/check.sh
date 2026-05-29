#!/usr/bin/env bash
# bin/check.sh — Gate de salud del arnes (claude.pm V2).
# Equivalente PM del init.sh: verifica invariantes del sistema antes de trabajar.
# Salida: exit 0 = sano (puedes trabajar). exit 1 = roto (para).
# Sin dependencias externas (POSIX shell + grep). JSON se valida con python3 si esta.

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

errores=0
fail() { echo "  [FALLO] $1"; errores=$((errores + 1)); }
ok()   { echo "  [ok]    $1"; }

echo "== check: salud del sistema =="

# 1) Ficheros y carpetas requeridos
for f in AGENTS.md CLAUDE.md STATUS.md _cola/trabajo.json _memory/_registry.json _memory/log.md; do
  if [ -f "$f" ]; then ok "existe $f"; else fail "falta $f"; fi
done
for d in _projects _memory _templates _inbox; do
  if [ -d "$d" ]; then ok "existe $d/"; else fail "falta $d/"; fi
done

# 2) Huerfanos: cada carpeta de proyecto debe estar en el registry
if [ -f _memory/_registry.json ]; then
  for dir in _projects/*/; do
    [ -d "$dir" ] || continue
    name="$(basename "$dir")"
    [ "$name" = "_archive" ] && continue
    if grep -q "\"id\": \"$name\"" _memory/_registry.json; then
      ok "proyecto '$name' registrado"
    elif [ ! -f "${dir}README.md" ]; then
      fail "'$name' no tiene README.md y no esta en el registry: parece una SUBCARPETA POR TIPO. _projects/ debe ser PLANO (una carpeta = un proyecto). El tipo va como campo 'Tipo:' en el README, no como carpeta. Anidar rompe check y status-syncer."
    else
      fail "proyecto '$name' existe en _projects/ pero NO esta en _registry.json (huerfano)"
    fi
  done
  # 3) Inverso: cada id del registry debe tener su carpeta
  ids="$(grep -o '"id": "[^"]*"' _memory/_registry.json | sed 's/"id": "//; s/"//')"
  for id in $ids; do
    if [ -d "_projects/$id" ]; then
      ok "registro '$id' tiene carpeta"
    else
      fail "registro '$id' en _registry.json pero NO existe _projects/$id/ (huerfano)"
    fi
  done
fi

# 4) log.md append-only: no debe haber lineas borradas respecto al ultimo commit
if git rev-parse --git-dir >/dev/null 2>&1; then
  borradas="$(git diff -- _memory/log.md | grep -Ec '^-[^-]' || true)"
  if [ "${borradas:-0}" -gt 0 ]; then
    fail "_memory/log.md tiene $borradas linea(s) borrada(s) sin commitear: el log es append-only"
  else
    ok "log.md append-only intacto"
  fi
fi

# 5) trabajo.json valido
# Buscamos un validador JSON que REALMENTE funcione (en Windows, 'python3' suele
# ser el stub del Microsoft Store, que existe pero no ejecuta nada).
if [ -f _cola/trabajo.json ]; then
  validador=""
  if command -v jq >/dev/null 2>&1 && jq --version >/dev/null 2>&1; then
    validador="jq"
  elif command -v python3 >/dev/null 2>&1 && python3 -c "" >/dev/null 2>&1; then
    validador="python3"
  elif command -v python >/dev/null 2>&1 && python -c "" >/dev/null 2>&1; then
    validador="python"
  fi

  if [ "$validador" = "jq" ]; then
    if jq empty _cola/trabajo.json >/dev/null 2>&1; then ok "trabajo.json es JSON valido (jq)"; else fail "trabajo.json no es JSON valido"; fi
  elif [ -n "$validador" ]; then
    if "$validador" -c "import json; json.load(open('_cola/trabajo.json'))" >/dev/null 2>&1; then ok "trabajo.json es JSON valido ($validador)"; else fail "trabajo.json no es JSON valido"; fi
  elif grep -q '"cola"' _cola/trabajo.json; then
    ok "trabajo.json presente (sin validador JSON; chequeo basico por grep)"
  else
    fail "trabajo.json sin clave 'cola'"
  fi
fi

echo "==============================="
if [ "$errores" -eq 0 ]; then
  mkdir -p _progress
  echo "ok $(date -u +%Y-%m-%dT%H:%M:%SZ)" >_progress/.check-ok 2>/dev/null || true
  echo "RESULTADO: sano. Puedes trabajar."
  exit 0
else
  rm -f _progress/.check-ok 2>/dev/null || true
  echo "RESULTADO: $errores problema(s). PARA y arregla antes de trabajar."
  exit 1
fi
