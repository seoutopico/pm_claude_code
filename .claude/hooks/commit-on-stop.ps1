# .claude/hooks/commit-on-stop.ps1 — Red de seguridad al cerrar (Stop).
# Por defecto NO commitea (la norma del repo es commitear solo cuando se pide).
# Solo auto-commitea si el operador deja el flag _control/AUTOCOMMIT.
# Asi se demuestra el patron "commit-on-stop" sin sorpresas.

$ErrorActionPreference = 'SilentlyContinue'
[Console]::In.ReadToEnd() | Out-Null
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $root

$cambios = git status --porcelain
if (-not $cambios) { exit 0 }

if (Test-Path (Join-Path $root '_control/AUTOCOMMIT')) {
  git add -A | Out-Null
  git commit -m "arnes: commit automatico al cerrar sesion (AUTOCOMMIT activo)" | Out-Null
}
exit 0
