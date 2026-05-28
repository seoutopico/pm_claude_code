# Onboarding — 5 minutos para empezar

Esta guía te lleva desde cero hasta tu primer reporte semanal.

## Requisitos

- [Claude Code](https://claude.com/claude-code) v2.0 o superior
- Node.js v16+ (`node --version` para verificar)
- En macOS/Linux para el módulo Sync: `rsync` (preinstalado en macOS, `apt install rsync` en Linux)

## 1. Crear tu vault

Un "vault" es la carpeta donde vas a guardar tus proyectos, reportes y notas. **Crea la carpeta primero y arranca Claude Code ahí** — así el plugin queda instalado solo en ese vault, no global:

```bash
mkdir mi-pm
cd mi-pm
claude
```

## 2. Instalar el plugin (solo en este vault)

Dentro de la sesión que acabas de abrir:

```
/plugin marketplace add seoutopico/pm_claude_code
/plugin install pm@pm-marketplace
```

Cuando te pregunte el scope, elige:

```
> Install for you, in this repo only (local scope)
```

Esto guarda el plugin en `mi-pm/.claude/settings.local.json`. Solo se activa cuando arrancas Claude Code en `mi-pm/` o subcarpetas, y solo para ti (nada se commitea al repo si versionas el vault con git).

Después:

```
/reload-plugins
```

Verifica con `/plugin` → pestaña Installed → debes ver `pm` activo.

## 3. Inicializar

Dentro de la sesión:

```
/pm:init
```

El wizard te preguntará:

| Pregunta | Sugerencia |
|---|---|
| Nombre | El tuyo |
| Idioma | `es` o `en` |
| Estructura de carpetas | `numerada` (01_Proyectos, 02_Reportes...) o `simple` (projects, reports...) |
| Cadencia del reporte | `weekly`, `monthly` o `none` |
| Estados/prioridades de proyecto | Acepta defaults la primera vez |
| Módulo Comunicaciones | `Sí` si vas a archivar mails/anuncios |
| Módulo Procesos | `Sí` si vas a documentar procedimientos |
| Módulo Reuniones | `Sí` si vas a tener actas |
| Módulo Sync | `No` por ahora (lo puedes activar después) |
| Configurar Obsidian | `Sí` si vas a abrir el vault con Obsidian (crea `.obsidian/` con `show-hidden-files` para ver/editar todo desde el editor visual) |
| Proyecto demo | `Sí` (te ayuda a ver la estructura) |

Tras el wizard tendrás en tu carpeta:

```
mi-pm/
├── .pm/config.json           # tu configuración
├── _config/projects.json     # registry de proyectos
├── _data/                    # históricos
├── _plantillas/              # plantillas Markdown
├── _inbox.md                 # tu inbox de notas libres
├── STATUS.md                 # vista resumida
├── 01_Proyectos/             # un proyecto demo dentro
├── 02_Reportes/Semanales/    # los reportes irán aquí
├── 03_Comunicaciones/        # si activaste el módulo
├── 04_Procesos/              # si activaste el módulo
└── 05_Reuniones/             # si activaste el módulo
```

## 4. Tu primer proyecto

```
/pm:nuevo-proyecto
```

Te pedirá:
- **id** en kebab-case (ej. `migracion-cms`)
- **name** legible (ej. "Migración CMS")
- **status**, **priority**, **keywords**

Las **keywords** son importantes: cuando luego escribas una nota libre que las contenga, `inbox-classifier` mandará esa nota a este proyecto.

## 5. Tu primera nota

Abre `_inbox.md` con tu editor favorito y escribe algo como:

```markdown
Migración CMS: hoy reunión con el equipo de infra. Decidimos usar Strapi v5. Próximos pasos: hacer POC esta semana.
```

Si tienes activado el módulo Comunicaciones, también puedes añadir bloques tipo:

```
Para: equipo@miempresa.com
Asunto: Update semanal

Hola equipo, esto es el resumen de...
```

## 6. Procesar el inbox

```
/pm:procesar
```

Esto:
1. Lee `_inbox.md`
2. Clasifica cada bloque (a qué proyecto pertenece, si es comunicación, si es proceso)
3. Actualiza los READMEs correspondientes (`Histórico`, `Próximos Pasos`, etc.)
4. Si era una comunicación, la archiva en `03_Comunicaciones/YYYY/`
5. Regenera `STATUS.md`
6. Vacía `_inbox.md`

Te reportará qué hizo y qué notas (si alguna) quedaron sin clasificar.

## 7. Tu primer reporte

```
/pm:reporte
```

Genera `02_Reportes/Semanales/semana_NN_YYYY-MM-DD.md` con:
- Contadores (activos, nuevos, cerrados, bloqueados)
- Tabla de cartera con Δ semanal
- Detalle por proyecto
- Bloqueantes transversales

Lo lees, lo copias donde lo necesites (mail, Slack, lo que sea).

## 8. Sincronizar la vista

Si editas un README a mano (en Obsidian, VSCode...), corre:

```
/pm:sync-view
```

Para regenerar `STATUS.md` desde los READMEs.

## Próximos pasos

- Personaliza nombres de carpetas, taxonomías o idioma → ver [`CUSTOMIZATION.md`](./CUSTOMIZATION.md)
- Activa el módulo Sync para espejar tu vault a OneDrive/Dropbox → ver `CUSTOMIZATION.md`
- Si algo no va → ver [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)
