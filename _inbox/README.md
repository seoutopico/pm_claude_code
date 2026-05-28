# Inbox

Esta carpeta es donde aterrizan tus notas sueltas antes de que Claude las distribuya.

## Cómo se usa

1. Durante el día, apunta en `_inbox.md` lo que se te ocurra. Sin estructura, sin pensar dónde va. Una línea por idea, o un párrafo, o lo que sea.

2. Cuando quieras procesar (al final del día, antes de una reunión, antes de salir del trabajo), abre Claude Code y lanza:
   ```
   /ingesta
   ```

3. Claude lee el inbox, clasifica cada nota y la distribuye:
   - Notas sobre un proyecto → al `README.md` de ese proyecto (en histórico).
   - Reuniones con fecha → a `_projects/<id>/meetings/<fecha>_<slug>.md`.
   - Decisiones → a `_memory/decisions.md` o a `_projects/<id>/decisions/`.
   - Cambios de personas → a `_memory/people.md`.
   - Lo que no encaje con confianza → te pregunta antes de descartar.

4. Al terminar, el inbox queda vacío y queda registro en `_memory/log.md`.

## Reglas

- **No metas aquí cosas estructuradas**. Si ya tienes claro dónde va, ve al sitio directamente.
- **No esperes demasiado**. Si el inbox crece a 20+ notas, el contexto al procesar se vuelve denso. Mejor cadencia diaria o cada 2 días.
- **No es un log permanente**. El inbox se vacía. Si quieres preservar algo tal cual, lánzalo a `_memory/index.md` o al README de un proyecto antes de ejecutar `/ingesta`.

## Formato sugerido (opcional)

Si quieres ayudar al clasificador, puedes prefijar:

- `[proyecto-x]` antes de una nota → la asocia al proyecto `proyecto-x`.
- `[reunion 30/05]` → la marca como reunión con esa fecha.
- `[decisión]` → la marca como decisión.

Pero **no es obligatorio**. El clasificador funciona sin prefijos.
