---
description: Inicializa un vault de claude-pm en el directorio actual. Crea .pm/config.json, carpetas, plantillas, inbox y status vacíos.
---

Ejecuta el wizard de inicialización del plugin.

Lanza el script `scripts/init.js` del plugin con Node:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/init.js"
```

El wizard pregunta interactivamente (en español): nombre del owner, idioma, estructura de carpetas (numerada/simple), cadencia del reporte (weekly/monthly/none), taxonomías de proyecto (estados, prioridades, activos) y si quiere instalar el proyecto demo.

Si el usuario incluye `--force`, pásalo: el wizard sobreescribirá `.pm/config.json` si ya existe.
Si incluye `--demo` o `--no-demo`, también pásalos.

Tras la ejecución, muestra al usuario las primeras tres líneas de "Próximos pasos" que el propio wizard imprime.

Si Node no está instalado o el script falla, escupe el error tal cual al usuario y sugiere instalar Node.js >= 16.
