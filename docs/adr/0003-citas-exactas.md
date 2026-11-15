# ADR-0003 · Las citas legales se validan por ley y artículo exactos

**Fecha:** 15/11/2026 · **Estado:** aceptado · **Autora:** Malena

## Contexto
`esArticuloVerificable` hacía `includes()` contra una lista que mezclaba artículos y nombres de ley. Con el formato que pide el prompt ("Art. X, Ley 20.744"), cualquier cita daba verificada, y "Art. 87" matcheaba por "Art. 8". El aviso "cita no verificada" de la UI nunca aparecía (issue #2).

## Decisión
**La whitelist es un mapa ley → artículos que el contexto curado menciona. La cita se parsea (artículos antes de "Ley"/"LCT"/"LDC", número de ley después) y se compara exacto.**
- Un artículo sin ley se toma como de la ley principal del modo.
- Una ley sin artículo vale si la ley está en el contexto.
- Con varios artículos, tienen que estar todos.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Pedirle al modelo un campo estructurado `{ley, articulo}` | Cambia el schema de salida y la UI; queda como mejora posible. |
| Regex por cita completa | Frágil ante variantes ("LCT", "Ley de Contrato de Trabajo", "24240"). |

## Consecuencias
Formatos raros (por ejemplo "inc. 2") pueden salir como no verificados. Es el lado seguro: aparece el aviso, no una confianza de más.

## Cómo se verifica
`lib/legal-context/articulos-validos.test.ts` y `app/api/analyze/route.test.ts` (CA-7).
