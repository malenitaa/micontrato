# ADR-0002 · El salario mínimo se elige por fecha de una tabla de escalones

**Fecha:** 15/11/2026 · **Estado:** aceptado · **Autora:** Malena

## Contexto
El salario mínimo (SMVM) estaba cargado como un valor fijo: $372.400 "desde 2025-12-01". En realidad era el escalón de julio de 2026 de la Res. 9/2025, con la fecha equivocada, y para noviembre de 2026 ya estaba vencido (rige la Res. 4/2026). Como el prompt deja señalar con confianza un básico por debajo del mínimo, un dato vencido produce respuestas falsas con certeza "alta". El link de verificación daba 404 (issue #1).

## Decisión
**`lib/legal-data.ts` tiene `SMVM_ESCALONES`, con todos los escalones de cada resolución copiados del Boletín Oficial, y `smvmVigente(fecha)` elige el vigente según la fecha en hora de Argentina.** El link de verificación es la página del Consejo del Salario. `/fuentes` se regenera cada hora (`revalidate = 3600`).

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Actualizar el valor fijo a mano cada mes | Ya falló una vez: el escalón cambia todos los meses. |
| Consultar el valor en línea | No hay una API oficial estable; scrapear argentina.gob.ar es frágil. |
| Usar la fecha UTC del server | El último día del mes, desde las 21 h, daría el escalón siguiente. |

## Consecuencias
- Cuando sale una resolución nueva, se agregan sus escalones al final de la tabla. Sin eso, después del último escalón conocido (abril de 2027) se sigue usando el último, y el prompt pide verificar en el link.
- Deuda: nada avisa cuando la tabla se queda sin escalones futuros (issue de seguimiento).

## Cómo se verifica
`lib/legal-data.test.ts` (escalón por fecha, borde de medianoche en Argentina, orden de la tabla) y `lib/prompts.test.ts` (CA-13).
