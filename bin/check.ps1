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
        elseif (-not (Test-Path (Join-Path $_.FullName 'README.md'))) {
          Fail "'$($_.Name)' no tiene README.md y no esta en el registry: parece una SUBCARPETA POR TIPO. _projects/ debe ser PLANO (una carpeta = un proyecto). El tipo va como campo 'Tipo:' en el README, no como carpeta. Anidar rompe check y status-syncer."
        }
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

# 6) Arnes enganchado al runtime (modo estricto): el sistema lo HACE CUMPLIR, no se confia en
#    que el modelo se acuerde de leer AGENTS.md. Estas tres reglas no pueden regresar en silencio.
# 6a) Hook SessionStart registrado (ejecuta el check + inyecta el protocolo al arrancar)
try {
  $settings = Get-Content '.claude/settings.json' -Raw | ConvertFrom-Json
  if ($settings.hooks.SessionStart) { OK "hook SessionStart registrado (arranque del arnes)" }
  else { Fail "falta el hook SessionStart en .claude/settings.json: el arnes NO se ejecutaria al arrancar (sin check ni protocolo). Sin el, vuelve el cortocircuito." }
} catch { Fail "no se pudo leer .claude/settings.json para verificar SessionStart" }

# 6b) CLAUDE.md importa @AGENTS.md (Claude Code carga CLAUDE.md, no AGENTS.md; el import mete el protocolo en contexto)
if (Test-Path 'CLAUDE.md') {
  if ((Get-Content 'CLAUDE.md' -Raw) -match '(?m)^@AGENTS\.md\b') { OK "CLAUDE.md importa @AGENTS.md (protocolo en contexto)" }
  else { Fail "CLAUDE.md no importa @AGENTS.md: el protocolo del arnes no entraria en contexto en cada sesion" }
}

# 6c) Skills y comandos de DOMINIO blindados (disable-model-invocation): el modelo no puede
#     cortocircuitar el arnes auto-invocandolos. Son playbooks que el lider/workers LEEN.
$dominio = @()
Get-ChildItem '.claude/skills' -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $sk = Join-Path $_.FullName 'SKILL.md'
  if (Test-Path $sk) { $dominio += $sk }
}
foreach ($c in @('nuevo','ingesta','digest','status-refresh','lint','setup')) {
  $cf = ".claude/commands/$c.md"
  if (Test-Path $cf) { $dominio += $cf }
}
$abiertos = @()
foreach ($f in $dominio) {
  if ((Get-Content $f -Raw) -notmatch 'disable-model-invocation:\s*true') { $abiertos += $f }
}
if ($abiertos.Count -eq 0) { OK "skills/comandos de dominio blindados (no auto-invocables)" }
else { Fail "se auto-invocarian y cortocircuitarian el arnes (falta 'disable-model-invocation: true'): $($abiertos -join ', ')" }

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
