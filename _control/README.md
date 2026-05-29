# _control — palanca del operador (tú)

Estos ficheros te dan control en caliente sobre el arnés. Los creas/borras tú (a mano, con el
explorador, o con `!` desde Claude Code). El agente no manda aquí: tú sí.

| Fichero | Efecto | Cómo se usa |
|---|---|---|
| `STOP` | **Parada de emergencia.** El hook `kill-switch` bloquea toda acción del agente mientras exista. | Crea el fichero para parar; **bórralo tú** para reanudar. |
| `STEER.md` | **Redirección en caliente.** Su contenido se inyecta en el siguiente turno y luego se vacía. | Escribe una instrucción y envía cualquier mensaje; el agente la leerá. |
| `AUTOCOMMIT` | **Red de seguridad.** Con este flag, el hook `commit-on-stop` commitea automáticamente al cerrar. Sin él, no se commitea solo. | Crea el fichero para activarlo; bórralo para desactivarlo. |

`STOP` y `AUTOCOMMIT` son transitorios y están en `.gitignore` (no se versionan).
