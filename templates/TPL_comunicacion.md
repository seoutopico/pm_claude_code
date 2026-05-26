---
date: {{date}}
subject: "{{subject}}"
type: {{type}}                  # update | announcement | request | report | decision | other
audience: []                    # tags libres: direccion, equipo, clientes, etc.
recipients: []                  # lista de destinatarios (emails o nombres)
channel: {{channel}}            # email | slack | teams | meeting | newsletter | other
links: []                       # URLs referenciadas en el cuerpo
attachments: []                 # nombres de adjuntos
follow_up: none                 # none | awaiting-reply | meeting-requested | closed
status: sent                    # draft | sent | archived
---

# {{subject}}

{{body}}

---

## Notas internas (opcional)

{{Solo si hay contexto que no aparece en el mensaje: por qué se envió ahora, follow-ups previstos, etc. Borrar la sección si no aplica.}}
