# .claude/hooks/verify-gate.ps1 — Contrato Default-FAIL (PreToolUse).
# Si se intenta escribir "done": true en _cola/trabajo.json y bin/check NO pasa,
# bloquea la escritura (exit 2). En cualquier otro caso, permite (exit 0).

$ErrorActionPreference = 'SilentlyContinue'

$raw = [Console]::In.ReadToEnd()
if (-not $raw) { exit 0 }
try { $hook = $raw | ConvertFrom-Json } catch { exit 0 }

$fp = $hook.tool_input.file_path
if (-not $fp) { exit 0 }
if ($fp -notmatch 'trabajo\.json$') { exit 0 }

# Texto que se va a escribir: Write -> content ; Edit -> new_string
$texto = "$($hook.tool_input.content)$($hook.tool_input.new_string)"
if ($texto -notmatch '"done"\s*:\s*true') { exit 0 }

# Se esta marcando done:true -> exigir check en verde
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)  # .claude/hooks -> .claude -> raiz
& powershell -NoProfile -ExecutionPolicy Bypass -File "$root\bin\check.ps1" *> $null
if ($LASTEXITCODE -ne 0) {
  [Console]::Error.WriteLine("verify-gate (Default-FAIL): BLOQUEADO. Intentas marcar done:true pero bin/check ha fallado. Ejecuta 'powershell -NoProfile -File bin/check.ps1', arregla lo que reporte (huerfanos, log append-only, etc.) y reintenta.")
  exit 2
}
exit 0
