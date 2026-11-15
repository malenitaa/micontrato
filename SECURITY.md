# Seguridad

## Reportar un problema

Usá el formulario privado de GitHub: <https://github.com/malenitaa/micontrato/security/advisories/new>. No abras un issue público: el sitio procesa documentos con datos personales.

Incluí qué encontraste, cómo reproducirlo y la versión (o el commit). Te contesto dentro de una semana.

## Versiones con soporte

Antes de 1.0, solo la última versión desplegada recibe arreglos de seguridad.

## Qué garantiza

| Garantía | Dónde | Test |
|---|---|---|
| El PDF original no sale del navegador; al server viajan el texto extraído y el nombre del archivo | `lib/pdf-extract.ts`, `components/FileUpload.tsx` | — (verificado a mano, 15/11/2026) |
| Nada se guarda: no hay base de datos ni cuentas | `app/api/analyze/route.ts` | — (verificado a mano, 15/11/2026) |
| Sin texto legible ni contexto, no se llama al modelo | `app/api/analyze/route.ts` | `app/api/analyze/route.test.ts` › CA-1 |
| El contenido del usuario no puede abrir ni cerrar los bloques de datos del prompt | `app/api/analyze/route.ts` (`neutralizarEtiquetas`) | `route.test.ts` › A1, `tests/peor-caso/route.test.ts` |
| Los errores de la API no exponen detalles (ni la clave) al navegador | `app/api/analyze/route.ts` | `route.test.ts` › CA-9 |
| Una cita legal no verificada o de un artículo reformado nunca sale con certeza "alta" | `app/api/analyze/route.ts`, `lib/legal-context/articulos-validos.ts` | `route.test.ts` › M1 |
| Los links de contacto los pone el server, no el modelo | `app/api/analyze/route.ts` | — (verificado en la auditoría, 15/11/2026) |
| Límites de entrada: 5 documentos, 120.000 caracteres | `app/api/analyze/route.ts` | `route.test.ts` › CA-3, CA-4 |
| CSP sin `object-src`, `base-uri` ni embebido en otros sitios | `next.config.mjs` | `next.config.test.ts` |
| La clave de la API vive solo en el server | variable de entorno `ANTHROPIC_API_KEY` | — (verificado en el build, 15/11/2026) |
| Sin scripts de instalación de dependencias | `.npmrc` | — (`npm config get ignore-scripts`) |

## Qué no hace nunca

- Guardar documentos, resultados o datos de quien lo usa.
- Loguear el contenido de los documentos o del contexto escrito.
- Iniciar un trámite o un reclamo en nombre de nadie.

## Alcance y límites

- El texto de los documentos sí viaja a la API de Claude (Anthropic) para generar el análisis, sujeto a su política de retención: <https://privacy.anthropic.com/>.
- El rate limit es por instancia y en memoria; el techo de gasto es el saldo prepago de la cuenta de la API ([ADR-0005](docs/adr/0005-techo-de-gasto-prepago.md)).
- Quien despliegue su propia copia no tiene que definir `ANTHROPIC_LOG=debug` en producción: el SDK loguearía el cuerpo de los pedidos.
- Detalle de la última revisión: [docs/AUDITORIA.md](docs/AUDITORIA.md).
