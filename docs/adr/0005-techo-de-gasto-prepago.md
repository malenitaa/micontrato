# ADR-0005 · El techo de gasto es el saldo prepago, sin rate limit compartido

**Fecha:** 15/11/2026 · **Estado:** aceptado · **Autora:** Malena

## Contexto
El rate limit (`lib/rate-limit.ts`, 5 pedidos por minuto por IP) vive en memoria por instancia: en Vercel, con varias instancias e IPs rotando, no pone techo. Cada pedido puede costar hasta unos US$0,06 (120.000 caracteres de entrada más 4.096 tokens de salida con Haiku 4.5). La auditoría planteó el riesgo de que alguien haga gastar la API en loop (issue #3).

Al revisar la consola el 15/11/2026: la cuenta es prepaga y la recarga automática está apagada. Hubo 0 pedidos en los 30 días anteriores. Una prueba técnica costó US$0,01.

## Decisión
**No se suma un rate limit compartido (Upstash) ni un tope diario. El techo es el saldo prepago de la cuenta de la API, con la recarga automática apagada: cuando se termina, la API deja de responder y no hay cobros nuevos.** El issue #3 se cerró como "no planeado".

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Upstash con rate limit compartido y tope diario | Una cuenta y una dependencia externa más, para un sitio sin tráfico. |
| Bajar el límite mensual en la consola | Opcional; la usuaria decidió dejarlo como está. |

## Consecuencias
- Un abuso puede consumir el saldo entero y dejar el sitio sin análisis hasta recargar. La persona ve el mensaje genérico de error (502), no uno que explique el cupo.
- **Si el sitio empieza a tener tráfico, o si se activa la recarga automática, esta decisión se revisa.**

## Cómo se verifica
Consola de Anthropic → Billing: "Auto-reload is off".
