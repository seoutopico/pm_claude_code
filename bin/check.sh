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

# 6) Arnes enganchado al runtime (modo estricto): se HACE CUMPLIR, no se confia en la memoria
#    del modelo. Estas tres reglas no pueden regresar en silencio.
# 6a) Hook SessionStart registrado
if grep -q '"SessionStart"' .claude/settings.json 2>/dev/null; then
  ok "hook SessionStart registrado (arranque del arnes)"
else
  fail "falta el hook SessionStart en .claude/settings.json: el arnes NO se ejecutaria al arrancar (sin check ni protocolo)"
fi
# 6b) CLAUDE.md importa @AGENTS.md
if grep -Eq '^@AGENTS\.md([[:space:]]|$)' CLAUDE.md 2>/dev/null; then
  ok "CLAUDE.md importa @AGENTS.md (protocolo en contexto)"
else
  fail "CLAUDE.md no importa @AGENTS.md: el protocolo del arnes no entraria en contexto"
fi
# 6c) Skills y comandos de dominio blindados (disable-model-invocation)
abiertos=""
for sk in .claude/skills/*/SKILL.md; do
  [ -f "$sk" ] || continue
  grep -q 'disable-model-invocation:[[:space:]]*true' "$sk" || abiertos="$abiertos $sk"
done
for c in nuevo ingesta digest status-refresh lint setup agenda; do
  cf=".claude/commands/$c.md"
  [ -f "$cf" ] || continue
  grep -q 'disable-model-invocation:[[:space:]]*true' "$cf" || abiertos="$abiertos $cf"
done
if [ -z "$abiertos" ]; then
  ok "skills/comandos de dominio blindados (no auto-invocables)"
else
  fail "se auto-invocarian y cortocircuitarian el arnes (falta 'disable-model-invocation: true'):$abiertos"
fi
# 6d) Hooks con ruta ABSOLUTA ($CLAUDE_PROJECT_DIR), no relativa. Con '-File .claude/...' el hook
#     falla si el cwd no es la raiz (tras un 'cd') y NO se ejecuta: apaga kill-switch y verify-gate
#     (Default-FAIL) en silencio. Invariante: ninguna ruta relativa en los registros de hooks.
if grep -Eq '\-File[[:space:]]+\.claude[\\/]+hooks' .claude/settings.json 2>/dev/null; then
  fail "hook(s) con ruta RELATIVA ('-File .claude/hooks/...'): fallan si el cwd no es la raiz del repo y dejan de ejecutarse (incluido verify-gate/Default-FAIL). Usa '-File \"\$CLAUDE_PROJECT_DIR/.claude/hooks/<x>.ps1\"'."
else
  ok "hooks con ruta absoluta (\$CLAUDE_PROJECT_DIR): resisten cambios de cwd"
fi

# 7) Conector de calendario (rama v3): gobernado y SOLO LECTURA. El calendario entra como TEXTO
#    derivado (_memory/calendar.md). Invariante: el worker que toca el conector no tiene tools de
#    escritura de calendario. Solo aplica si la integracion esta presente.
agenda=".claude/agents/agenda-syncer.md"
if [ -f "$agenda" ]; then
  ok "worker agenda-syncer presente"
  writetools=""
  for v in create_event update_event delete_event respond_to_event; do
    grep -q "$v" "$agenda" && writetools="$writetools $v"
  done
  if [ -z "$writetools" ]; then
    ok "agenda-syncer es solo-lectura (sin tools de escritura de calendario)"
  else
    fail "agenda-syncer expone herramientas de ESCRITURA de calendario ($writetools): rompe el invariante read-only"
  fi
  if [ -f _memory/calendar.md ]; then ok "existe _memory/calendar.md (espejo del calendario)"; else fail "falta _memory/calendar.md"; fi
  if [ -f .mcp.json ]; then
    if grep -q 'mcpServers' .mcp.json; then ok ".mcp.json presente"; else fail ".mcp.json sin clave mcpServers"; fi
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
