---
description: Espeja el vault (o las carpetas configuradas) a un destino externo (OneDrive, Dropbox, NAS, otro path). Cross-platform: robocopy en Windows, rsync en Unix.
---

Ejecuta el script `scripts/sync.js` del plugin:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/sync.js"
```

Acepta flags opcionales:
- `--dry-run` → simula sin escribir
- `--verbose` → log detallado

El script:
1. Lee `.pm/config.json:sync.{destination, sources, exclude_files, exclude_dirs}`.
2. Resuelve variables de entorno tipo `${env:VAR_NAME}` en el destino.
3. Verifica que `sync.enabled` es `true`.
4. Para cada `source`, ejecuta robocopy/rsync con `/MIR` (espejo bidireccional eliminando del destino lo que no esté en origen).
5. Reporta resultado y código de salida.

**Configuración mínima en `.pm/config.json`:**

```json
{
  "sync": {
    "enabled": true,
    "destination": "C:/Users/me/OneDrive/Mirror"
  }
}
```

Si el usuario pasa flags adicionales en el comando (ej. `/pm:sync --dry-run`), pásalos al script.

Si el script falla porque rsync no está instalado (en macOS/Linux), informa al usuario.
