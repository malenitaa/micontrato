# ADR-0007 · El server baja la certeza de las citas dudosas

**Fecha:** 15/11/2026 · **Estado:** aceptado · **Autora:** Malena

## Contexto
La auditoría (M1) mostró que una irregularidad con "Art. 8, Ley 24.013" salía `articuloVerificado: true` y `certeza: "alta"`, aunque `laboral.md` dice que esa multa habría sido derogada. En pantalla no aparecía ninguna advertencia: el badge "A verificar" depende solo de la certeza, y la certeza la elige el modelo.

## Decisión
**En `route.ts`, toda irregularidad cuya cita no esté verificada, o que sea de un artículo marcado como reformado recientemente (`ARTICULOS_REFORMADOS_LABORAL`), sale con `certeza: "requiere_verificacion"`, diga lo que diga el modelo.** Un artículo reformado sigue contando como "verificado": existe en el contexto curado.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Confiar en el prompt ("ante la duda, requiere_verificacion") | El modelo no siempre lo cumple, y una inyección (A1) lo puede torcer. |
| Una leyenda nueva "artículo reformado" en la UI | Más UI para el mismo mensaje; el badge "A verificar" ya existe. |

## Consecuencias
- Visible: más irregularidades llevan el badge "A verificar".
- Al cambiar `laboral.md` (por ejemplo, si se verifica el texto de la Ley 27.802), hay que actualizar `ARTICULOS_REFORMADOS_LABORAL`.

## Cómo se verifica
`app/api/analyze/route.test.ts` › M1 y `lib/legal-context/articulos-validos.test.ts` › esArticuloReformado.
