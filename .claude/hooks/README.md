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
powershell -NoProfile -ExecutionPolicy Bypass -File .claude/hooks/verify-gate.ps1
```

a:

```
bash .claude/hooks/verify-gate.sh
```

(y da permisos de ejecución: `chmod +x .claude/hooks/*.sh bin/*.sh`).
