# ADR-0008 · Todos los "<" y ">" del contenido del usuario se neutralizan

**Fecha:** 15/11/2026 · **Estado:** aceptado · **Autora:** Malena

## Contexto
El contenido va entre `<documento>` y `<contexto_usuario>`. La auditoría (A1) y la prueba de peor caso mostraron que se podía cerrar la etiqueta desde el texto, el contexto o el nombre del archivo, y dejar instrucciones afuera. pdfjs extrae texto invisible: quien redacta el contrato puede esconderlas. Un primer arreglo, que solo reemplazaba las dos etiquetas exactas, se esquivaba con `< /documento>`, saltos de línea, espacios de ancho cero o `＜` de ancho completo.

## Decisión
**El texto, el contexto y el nombre se normalizan con NFKC y todos los `<` y `>` pasan a `‹` y `›`. El nombre queda en una sola línea, y el turno del usuario cierra con una instrucción fija después de los datos.**

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Reemplazar solo `</documento>` y `</contexto_usuario>` | Se esquivaba con variantes (probado). |
| Etiquetas con un nonce por pedido | Más complejo; con los `<` neutralizados no hace falta. |
| No mandar el nombre del archivo | El nombre ayuda al modelo a distinguir documentos ("oferta" vs. "factura"). |

## Consecuencias
- El modelo ve `‹` y `›` donde el documento tenía `<` y `>`; en contratos y recibos es raro y no cambia el análisis.
- NFKC cambia algunos caracteres (ligaduras, ancho completo, tildes combinadas) a su forma canónica.

## Cómo se verifica
`app/api/analyze/route.test.ts` › A1 y `tests/peor-caso/route.test.ts` › inyección en el prompt.
