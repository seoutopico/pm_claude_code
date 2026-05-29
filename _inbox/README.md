# Inbox

Esta carpeta es donde aterrizan tus notas sueltas —y cualquier adjunto— antes de que Claude las distribuya.

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

## Adjuntos: imágenes, PDFs, transcripciones…

El inbox **no es solo texto**. Aquí también puedes soltar:

- Imágenes (capturas, fotos de una pizarra).
- PDFs (un contrato, un brief, un acta).
- Transcripciones de reuniones (texto largo, `.md` o `.txt`).
- Cualquier fichero que quieras que se procese y se archive donde toque.

Por eso el inbox es una **carpeta** y no un único fichero: déjalos junto a `_inbox.md` (por
ejemplo `_inbox/2026-05-30_pizarra.png` o `_inbox/acta-kickoff.pdf`). Al lanzar `/ingesta`, el
clasificador los tiene en cuenta igual que las notas y los distribuye al proyecto, reunión o
decisión que corresponda (moviendo el fichero a su destino, p. ej. `_projects/<id>/docs/`).

> Regla que se mantiene: el inbox es tuyo. El arnés **lee** lo que dejes aquí, pero nunca
> escribe en `_inbox/` por su cuenta.

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
