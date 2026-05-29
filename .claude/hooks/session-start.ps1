# .claude/hooks/session-start.ps1 — Arranque del arnes (evento SessionStart).
# Cierra el agujero historico: el arnes ya NO depende de que el modelo "se acuerde" de
# leer AGENTS.md. En cada arranque (startup|resume|clear|compact) este hook:
#   1) ejecuta bin/check (gate de salud),
#   2) inyecta el protocolo ESTRICTO como additionalContext (lo ve el modelo, no el chat).
# Salida: JSON con hookSpecificOutput.additionalContext (doc: code.claude.com/docs/en/hooks).

$ErrorActionPreference = 'SilentlyContinue'
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)   # .claude/hooks -> .claude -> raiz
Set-Location $root

# 1) Gate de salud (silencioso: solo nos importa el codigo de salida, no su texto)
& powershell -NoProfile -ExecutionPolicy Bypass -File "$root\bin\check.ps1" 2>&1 | Out-Null
$checkOk = ($LASTEXITCODE -eq 0)

# 2) Estado de la cola de trabajo
$pend = 0
try {
  $cola = Get-Content "$root\_cola\trabajo.json" -Raw | ConvertFrom-Json
  $pend = @($cola.cola | Where-Object { -not $_.done }).Count
} catch { }

$estado = if ($checkOk) { "PASO (sistema sano, puedes trabajar)" } else { "FALLO -> PARA y reporta; NO trabajes sobre un sistema roto" }

$ctx = @"
== claude.pm V2 - ARNES ESTRICTO ACTIVO ==
bin/check: $estado
Cola: $pend unidad(es) con done:false en _cola/trabajo.json.

REGLA INNEGOCIABLE (modo estricto): no ejecutes el trabajo del usuario llamando directamente
a skills o comandos de dominio (nuevo-proyecto, ingesta, digest, status-refresh, lint). Estan en
'disable-model-invocation' a proposito: son PLAYBOOKS que el LIDER y los workers LEEN y ejecutan,
no atajos auto-invocables. Si te saltas el arnes, pierdes la verificacion y el Default-FAIL.

Todo trabajo pasa por el arnes:
  1. Convierte la peticion del usuario en una o varias unidades en _cola/trabajo.json (done:false).
  2. Adopta el rol de LIDER (.claude/agents/lider.md): orquesta workers; cada worker escribe su
     resultado en _progress/<run-id>/ (contexto limpio, nada de telefono descompuesto).
  3. Lanza al REVISOR (.claude/agents/revisor.md): devuelve PASS o NEEDS_WORK.
  4. DEFAULT-FAIL: solo marcas "done": true si revisor=PASS y bin/check pasa. El hook verify-gate
     lo hace cumplir: bloquea la escritura si el check no esta en verde.

Lee AGENTS.md para el protocolo completo y el mapa del repo. Para cambiar el SISTEMA (tipos,
plantillas, skills, agentes, hooks, config) usa /extender (arquitecto), nunca a mano.
Controles del operador: crea _control/STOP para parar en seco; escribe en _control/STEER.md para
redirigir sin reiniciar.
"@

$out = @{
  hookSpecificOutput = @{
    hookEventName     = "SessionStart"
    additionalContext = $ctx
  }
}
$out | ConvertTo-Json -Depth 5 -Compress
exit 0
