# .claude/hooks/kill-switch.ps1 — Parada de emergencia (PreToolUse, todas las tools).
# Si existe _control/STOP, bloquea CUALQUIER accion del agente (exit 2).
# El operador (humano) reanuda borrando el fichero _control/STOP.

$ErrorActionPreference = 'SilentlyContinue'
[Console]::In.ReadToEnd() | Out-Null
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
if (Test-Path (Join-Path $root '_control/STOP')) {
  [Console]::Error.WriteLine("kill-switch: el operador ha activado _control/STOP. Todas las acciones estan bloqueadas. Borra _control/STOP para reanudar.")
  exit 2
}
exit 0
