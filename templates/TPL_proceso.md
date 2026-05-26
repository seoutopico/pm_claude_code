---
name: "{{name}}"
slug: {{slug}}
category: {{category}}            # finance | hr | legal | it | training | governance | communication | other
tags: []                          # palabras clave libres para búsqueda
status: draft                     # draft | partial | complete
trigger: "{{trigger}}"            # Una línea: cuándo se dispara este proceso
owner: "{{owner}}"
created: {{today}}
last_updated: {{today}}
---

# {{name}}

> {{Una línea: qué hace este proceso y cuándo aplica}}

## Cuándo se usa

{{Detalle del trigger: situación concreta, frecuencia esperada, quién dispara el proceso, qué resultado se busca}}

## Datos de referencia

{{Constantes que este proceso necesita siempre: datos fiscales, URLs, contactos clave, plantillas. Si no aplica, borrar la sección.}}

## Pasos

1. **{{Acción}}** — {{detalle}}. Responsable: {{quién}}. Output: {{qué se produce / a quién va}}.
2. ...

## Pendientes / TBD

- [ ] {{Sub-proceso o paso que aún no se conoce. Borrar la sección si está completo.}}

## Notas

{{Contexto opcional: por qué se hace así, alternativas evaluadas, casos límite. Borrar si no aplica.}}

## Histórico

| Fecha | Cambio |
|-------|--------|
| {{today}} | Primera versión |
