# MiContrato — especificación

**Estado:** vigente · **Última revisión:** 15/11/2026 · Escrita en el cierre desde el pedido original (README técnico del commit `5fdbcf4`) y el código. Lo deducido del código va marcado `[a confirmar]`.

## 1. Qué es y para quién

Una página web para personas en Argentina que tienen un contrato de trabajo, un recibo de sueldo o una factura de consumo y no saben si algo está mal. Les da una primera orientación en lenguaje simple, a la luz de la Ley de Contrato de Trabajo (20.744) o de la Ley de Defensa del Consumidor (24.240). No es asesoramiento legal.

## 2. Qué hace

1. Elegís el modo: **Laboral** o **Consumidor**.
2. Subís uno o más PDFs (hasta 15 MB cada uno). El texto se extrae en tu navegador; el archivo no se sube. Si el PDF tiene contraseña, está dañado o es un escaneo sin texto, te lo dice.
3. O pegás el texto directamente.
4. Opcionalmente contás lo que el documento no dice (por ejemplo, que cobrás una parte en efectivo).
5. En modo Consumidor, opcionalmente elegís el rubro de una lista fija.
6. Recibís un resultado en secciones: lo que está en regla, posibles irregularidades (una por una, con la ley y el artículo) y tus derechos básicos. Cada punto dice si la certeza es alta o si conviene verificarlo.
7. Si una irregularidad cita un artículo que no está en el contexto legal curado, aparece marcada como "cita generada por IA, no verificada".
8. Si hay al menos una irregularidad, el resultado cierra con contactos reales para pedir orientación (teléfonos del Ministerio de Trabajo, Ventanilla Única de Defensa del Consumidor).
9. En modo Laboral, el análisis compara contra el **salario mínimo vigente a la fecha de la consulta** (hora de Argentina), con su resolución y su link oficial.
10. La página `/fuentes` explica de dónde sale cada dato, incluido el salario mínimo vigente.

## 3. Qué no hace (a propósito)

- **No es asesoramiento legal** ni inicia trámites. Lo dicen el banner fijo, el README y `/fuentes`.
- **No guarda nada**: no hay cuentas, ni base de datos, ni historial. El documento vive en la pestaña y en el pedido puntual de análisis.
- **No conoce los convenios colectivos (CCT)**: no inventa escalas ni nombres de convenio; sugiere consultarlos.
- **No afirma cifras de reformas recientes** (Leyes 27.742 y 27.802): el contexto legal las marca como "reformado recientemente" y el modelo tiene que remitir al texto vigente.
- **No lee imágenes ni PDFs escaneados** (no hay OCR).
- **No es RAG** ni manda la ley completa: usa un resumen curado a mano (`lib/legal-context/*.md`).

## 4. Principios no negociables

- **El archivo original no sale del navegador.** Solo viaja el texto extraído.
- **El backend no loguea el contenido** de los documentos ni del contexto; solo el error del SDK si la llamada al modelo falla.
- **Sin datos legibles no se llama al modelo** (no se gasta una consulta en nada).
- **El contenido del usuario es dato, no instrucción**: va entre etiquetas `<documento>` y `<contexto_usuario>` con todos sus `<`/`>` neutralizados, y el prompt le dice al modelo que no siga instrucciones de adentro (ADR-0008).
- **Una cita dudosa nunca sale con certeza alta**: el server lo fuerza (ADR-0007).
- **Lo que vence se elige por fecha, no a mano**: el salario mínimo sale de una tabla de escalones con su resolución.
- **La clave de la API vive solo en el server.**

## 5. Criterios de aceptación

| # | Dado | Cuando | Entonces | Test |
|---|---|---|---|---|
| CA-1 | un pedido sin documentos legibles ni contexto | se analiza | responde "insuficiente" **sin llamar al modelo** | `app/api/analyze/route.test.ts` › CA-1 |
| CA-2 | un `modo` que no es `laboral` ni `consumidor` | se analiza | responde 400 | `route.test.ts` › CA-2 |
| CA-3 | más de 5 documentos | se analiza | responde 400 sin llamar al modelo | `route.test.ts` › CA-3 |
| CA-4 | más de 120.000 caracteres en total | se analiza | responde 413 sin llamar al modelo | `route.test.ts` › CA-4 |
| CA-5 | un `rubro` fuera de la lista fija | se analiza en modo Consumidor | el rubro se descarta y no llega al modelo | `route.test.ts` › CA-5 |
| CA-6 | un documento y contexto válidos | se analiza | el modelo recibe el texto entre `<documento>` y el contexto entre `<contexto_usuario>`, y el system prompt incluye el aviso de aislamiento | `route.test.ts` › CA-6 |
| CA-7 | una irregularidad con un artículo fuera del contexto curado | se arma la respuesta | `articuloVerificado` es `false`; con uno del contexto, `true` | `route.test.ts` › CA-7 y `lib/legal-context/articulos-validos.test.ts` |
| CA-8 | al menos una irregularidad | se arma la respuesta | incluye los recursos de contacto del modo; sin irregularidades, `recursos` es `null` | `route.test.ts` › CA-8 |
| CA-9 | la API del modelo falla | se analiza | responde 502 con un mensaje genérico, sin detalles del error | `route.test.ts` › CA-9 |
| CA-10 | el modelo se niega (`refusal`) | se analiza | responde 422 con un mensaje claro | `route.test.ts` › CA-10 |
| CA-11 | más de 5 pedidos por minuto desde la misma IP | se analiza | el sexto responde 429 | `lib/rate-limit.test.ts` |
| CA-12 | una fecha cualquiera | se pide el salario mínimo | devuelve el escalón vigente en hora de Argentina | `lib/legal-data.test.ts` |
| CA-13 | modo Laboral | se arma el system prompt | incluye el salario mínimo vigente, su fecha, su resolución y el link oficial | `lib/prompts.test.ts` |
| CA-15 | un texto, contexto o nombre de archivo con etiquetas (en cualquier variante) | se analiza | no puede abrir ni cerrar los bloques de datos del prompt | `route.test.ts` › A1 |
| CA-16 | una irregularidad con una cita no verificada o a un artículo reformado | el modelo la marca con certeza alta | sale con "requiere_verificacion" | `route.test.ts` › M1 |
| CA-17 | ya pasó el mes del último escalón cargado del salario mínimo | se arma el prompt laboral | avisa que el valor puede estar desactualizado | `lib/prompts.test.ts`, `lib/legal-data.test.ts` |
| CA-18 | la respuesta del modelo omite listas o trae valores `null` | se arma la respuesta | las listas vuelven vacías y no hay 500 | `route.test.ts` › L2, `tests/peor-caso/route.test.ts` |
| CA-14 | un PDF con contraseña, dañado o escaneado | se sube | se marca como no legible con el motivo y no se manda texto inventado | — (extracción en navegador con pdfjs; verificado a mano en el scaffold, no en este cierre) |

## 6. Casos borde y errores

- **PDF ilegible:** el documento va al modelo con un aviso de "no se pudo extraer texto" en vez de contenido, para que no invente.
- **Sin red o error del modelo:** la UI muestra un mensaje claro y deja reintentar; no muestra un resultado falso.
- **Respuesta del modelo que no es JSON válido:** 502 "No se pudo interpretar la respuesta del análisis".
- **Rate limit:** 429 con "Esperá un minuto". Es en memoria por instancia (ver issue #3, cerrado: el techo de gasto es el saldo prepago de la cuenta de la API).
- **Después del último escalón conocido del salario mínimo** (abril 2027) se usa el último; desde el mes siguiente, el prompt avisa que puede estar desactualizado, y un test canario hace fallar la CI semanal.
- **Respuesta cortada por `max_tokens`:** 502 con un mensaje que lo explica.

## 7. Fuera de alcance por ahora

- OCR para PDFs escaneados.
- Escalas de convenios colectivos.
- Guardar resultados o compartirlos.
- Rate limit compartido entre instancias y tope diario (issue #3, decidido no hacerlo con el tráfico actual).
