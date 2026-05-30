# Hooks del arnés

Estos hooks son la "fontanería" que hace cumplir el contrato del arnés de forma
determinista (no dependen de que el agente se acuerde).

| Hook | Evento | Qué hace |
|---|---|---|
| `session-start` | `SessionStart` (startup/resume/clear/compact) | Ejecuta `bin/check` e inyecta el protocolo ESTRICTO como `additionalContext`. Es lo que engancha el arnés al arranque (antes dependía de que el modelo leyera `AGENTS.md`). |
| `kill-switch` | `PreToolUse` (todas) | Bloquea cualquier acción mientras exista `_control/STOP`. |
| `verify-gate` | `PreToolUse` (Edit/Write) | Bloquea marcar `"done": true` en `_cola/trabajo.json` si `bin/check` no pasa. |
| `steer` | `UserPromptSubmit` | Inyecta el contenido de `_control/STEER.md` en el turno y lo vacía. |
| `commit-on-stop` | `Stop` | Red de seguridad: auto-commitea al cerrar **solo** si existe `_control/AUTOCOMMIT`. |

## Portabilidad (importante)

Cada hook tiene dos versiones: `.ps1` (Windows) y `.sh` (mac/linux). El registro en
`.claude/settings.json` apunta a la versión **PowerShell** porque el repo se desarrolla en
Windows.

**Si clonas en mac/linux**, cambia en `.claude/settings.json` el comando del hook de:

```
powershell -NoProfile -ExecutionPolicy Bypass -File "$CLAUDE_PROJECT_DIR/.claude/hooks/verify-gate.ps1"
```

a:

```
bash "$CLAUDE_PROJECT_DIR/.claude/hooks/verify-gate.sh"
```

(y da permisos de ejecución: `chmod +x .claude/hooks/*.sh bin/*.sh`).

## Ruta absoluta obligatoria (`$CLAUDE_PROJECT_DIR`)

Los registros en `.claude/settings.json` usan `$CLAUDE_PROJECT_DIR` (ruta absoluta a la raíz del
repo, que Claude Code inyecta a los hooks), **no** rutas relativas tipo `.claude/hooks/...`. Con
ruta relativa, el hook se resuelve contra el *directorio de trabajo actual*: en cuanto un agente
hace `cd` a una subcarpeta (p. ej. `_projects/<id>/`), PowerShell ya no encuentra el `.ps1` y el
hook **falla sin ejecutarse** — apagando en silencio el `kill-switch` y, lo más grave, el
`verify-gate` (el contrato Default-FAIL deja de blindar el cierre). `bin/check` (§6d) falla si
vuelve a colarse una ruta relativa.
