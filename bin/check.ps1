# bin/check.ps1 — Gate de salud del arnes (claude.pm V2), version PowerShell.
# Equivalente PM del init.sh: verifica invariantes del sistema antes de trabajar.
# Salida: exit 0 = sano. exit 1 = roto. Sin dependencias externas (parser JSON nativo).

$root = Split-Path -Parent $PSScriptRoot   # PSScriptRoot = bin/ ; parent = raiz del repo
Set-Location $root

$script:errores = 0
function Fail($m) { Write-Host "  [FALLO] $m"; $script:errores++ }
function OK($m)   { Write-Host "  [ok]    $m" }

Write-Host "== check: salud del sistema =="

# 1) Ficheros y carpetas requeridos
foreach ($f in @('AGENTS.md', 'CLAUDE.md', 'STATUS.md', '_cola/trabajo.json', '_memory/_registry.json', '_memory/log.md')) {
  if (Test-Path $f) { OK "existe $f" } else { Fail "falta $f" }
}
foreach ($d in @('_projects', '_memory', '_templates', '_inbox')) {
  if (Test-Path $d) { OK "existe $d/" } else { Fail "falta $d/" }
}

# 2/3) Huerfanos en ambos sentidos con el parser JSON nativo
if (Test-Path '_memory/_registry.json') {
  try {
    $reg = Get-Content '_memory/_registry.json' -Raw | ConvertFrom-Json
    $ids = @($reg.projects.id)
    Get-ChildItem _projects -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -ne '_archive' } |
      ForEach-Object {
        if ($ids -contains $_.Name) { OK "proyecto '$($_.Name)' registrado" }
        else { Fail "proyecto '$($_.Name)' existe en _projects/ pero NO esta en _registry.json (huerfano)" }
      }
    foreach ($id in $ids) {
      if (Test-Path "_projects/$id") { OK "registro '$id' tiene carpeta" }
      else { Fail "registro '$id' en _registry.json pero NO existe _projects/$id/ (huerfano)" }
    }
  } catch {
    Fail "_registry.json no es JSON valido: $($_.Exception.Message)"
  }
}

# 4) log.md append-only: sin lineas borradas respecto al ultimo commit
try {
  $diff = git diff -- _memory/log.md
  $borradas = @($diff | Where-Object { $_ -match '^-[^-]' }).Count
  if ($borradas -gt 0) { Fail "_memory/log.md tiene $borradas linea(s) borrada(s) sin commitear: el log es append-only" }
  else { OK "log.md append-only intacto" }
} catch { }

# 5) trabajo.json valido
if (Test-Path '_cola/trabajo.json') {
  try {
    Get-Content '_cola/trabajo.json' -Raw | ConvertFrom-Json | Out-Null
    OK "trabajo.json es JSON valido"
  } catch {
    Fail "trabajo.json no es JSON valido"
  }
}

Write-Host "==============================="
if ($script:errores -eq 0) {
  New-Item -ItemType Directory -Force _progress | Out-Null
  "ok" | Out-File -Encoding utf8 _progress/.check-ok
  Write-Host "RESULTADO: sano. Puedes trabajar."
  exit 0
} else {
  Remove-Item _progress/.check-ok -ErrorAction SilentlyContinue
  Write-Host "RESULTADO: $($script:errores) problema(s). PARA y arregla antes de trabajar."
  exit 1
}
