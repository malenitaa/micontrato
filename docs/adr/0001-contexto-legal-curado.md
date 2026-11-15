# ADR-0001 · Contexto legal curado en Markdown, no RAG

**Fecha:** 15/07/2026 (escrito en el cierre del 15/11/2026) · **Estado:** aceptado · **Autora:** Malena

## Contexto
El modelo tiene que responder sobre dos leyes (LCT 20.744 y LDC 24.240) que tuvieron reformas recientes (Leyes 27.742 de 2024 y 27.802 de 2026), algunas todavía sin verificar línea por línea. Mandar la ley completa es caro y no evita que el modelo afirme cifras de reformas dudosas.

## Decisión
**Cada modo tiene un resumen curado a mano (`lib/legal-context/laboral.md` y `consumidor.md`) con solo los puntos que la app detecta, el artículo de referencia y una marca "⚠️ reformado recientemente" donde no hay certeza.** El system prompt lo incluye entero.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| RAG sobre el texto oficial | Infraestructura (índice, embeddings) para un proyecto chico, y no resuelve las reformas sin verificar. |
| Mandar la ley completa | Costo por consulta mucho mayor y más superficie para que el modelo cite artículos irrelevantes. |
| Sin contexto, confiar en el modelo | Cifras y artículos inventados con confianza. |

## Consecuencias
- El contexto hay que mantenerlo a mano cuando cambia la ley.
- Las citas del modelo se pueden validar contra el resumen (ver ADR-0003).
- Los datos que vencen (salario mínimo) no van en el Markdown sino en código (ver ADR-0002).

## Cómo se verifica
`lib/prompts.test.ts`: el prompt de cada modo incluye su contexto legal.
