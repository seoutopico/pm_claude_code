#!/usr/bin/env bash
# .claude/hooks/session-start.sh — Arranque del arnes (evento SessionStart), gemelo POSIX.
# En cada arranque (startup|resume|clear|compact): ejecuta bin/check e inyecta el protocolo
# ESTRICTO como additionalContext. Asi el arnes deja de depender de que el modelo lea AGENTS.md.
# Salida: JSON con hookSpecificOutput.additionalContext (doc: code.claude.com/docs/en/hooks).

set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"   # .claude/hooks -> .claude -> raiz
cd "$ROOT" || exit 0

# 1) Gate de salud (silencioso: solo el codigo de salida)
if bash "$ROOT/bin/check.sh" >/dev/null 2>&1; then check_ok=1; else check_ok=0; fi

# 2) Estado de la cola
pend=0
if [ -f _cola/trabajo.json ]; then
  pend="$(grep -Eo '"done"[[:space:]]*:[[:space:]]*false' _cola/trabajo.json | wc -l | tr -d ' ')"
fi

if [ "$check_ok" -eq 1 ]; then
  estado="PASO (sistema sano, puedes trabajar)"
else
  estado="FALLO -> PARA y reporta; NO trabajes sobre un sistema roto"
fi

ctx="== claude.pm V2 - ARNES ESTRICTO ACTIVO ==
bin/check: $estado
Cola: $pend unidad(es) con done:false en _cola/trabajo.json.

REGLA INNEGOCIABLE (modo estricto): no ejecutes el trabajo del usuario llamando directamente a skills o comandos de dominio (nuevo-proyecto, ingesta, digest, status-refresh, lint). Estan en 'disable-model-invocation' a proposito: son PLAYBOOKS que el LIDER y los workers LEEN y ejecutan, no atajos auto-invocables. Si te saltas el arnes, pierdes la verificacion y el Default-FAIL.

Todo trabajo pasa por el arnes:
  1. Convierte la peticion del usuario en una o varias unidades en _cola/trabajo.json (done:false).
  2. Adopta el rol de LIDER (.claude/agents/lider.md): orquesta workers; cada worker escribe su resultado en _progress/<run-id>/ (contexto limpio).
  3. Lanza al REVISOR (.claude/agents/revisor.md): devuelve PASS o NEEDS_WORK.
  4. DEFAULT-FAIL: solo marcas \"done\": true si revisor=PASS y bin/check pasa. El hook verify-gate lo hace cumplir.

Lee AGENTS.md para el protocolo completo. Para cambiar el SISTEMA usa /extender (arquitecto), nunca a mano. Controles: crea _control/STOP para parar; escribe en _control/STEER.md para redirigir."

# Emitir JSON con additionalContext. Usamos un validador si existe; si no, escapamos a mano.
if command -v jq >/dev/null 2>&1 && jq --version >/dev/null 2>&1; then
  jq -n --arg c "$ctx" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$c}}'
else
  esc="$(printf '%s' "$ctx" | sed 's/\\/\\\\/g; s/"/\\"/g' | awk 'BEGIN{ORS="\\n"}{print}')"
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$esc"
fi
exit 0
