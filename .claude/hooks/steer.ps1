# .claude/hooks/steer.ps1 — Redireccion en caliente (UserPromptSubmit).
# Si _control/STEER.md tiene contenido, lo inyecta en el contexto del turno y lo vacia,
# para que el operador reoriente al agente sin reiniciar la sesion.

$ErrorActionPreference = 'SilentlyContinue'
[Console]::In.ReadToEnd() | Out-Null
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$steer = Join-Path $root '_control/STEER.md'
if (Test-Path $steer) {
  $content = Get-Content $steer -Raw
  if ($content -and $content.Trim().Length -gt 0) {
    Write-Output "[STEER del operador] Hay una redireccion en _control/STEER.md. Tenla en cuenta AHORA antes de seguir:`n$content`n(El fichero se ha vaciado tras leerlo.)"
    Set-Content -Path $steer -Value "" -Encoding utf8
  }
}
exit 0
