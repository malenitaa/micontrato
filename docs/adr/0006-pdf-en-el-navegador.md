# ADR-0006 · El PDF se lee en el navegador; al server viaja solo el texto

**Fecha:** 15/07/2026 (escrito en el cierre del 15/11/2026) · **Estado:** aceptado · **Autora:** Malena

## Contexto
Los documentos tienen datos personales (sueldo, DNI, CUIL, domicilio). Subir el PDF entero al server agranda la superficie (almacenamiento temporal, parsing de archivos externos en el backend) sin agregar nada al análisis, que solo usa texto.

## Decisión
**`lib/pdf-extract.ts` usa pdfjs-dist en el cliente; el endpoint recibe JSON con el texto extraído.** Los PDFs protegidos, dañados o escaneados se marcan como no legibles con su motivo.

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Subir el PDF al server | Más datos personales en tránsito y parsing de archivos externos en el backend. |
| Mandar el PDF como documento a Claude | Lee escaneados, pero manda el archivo entero a un tercero y cuesta más. |

## Consecuencias
- No hay OCR: los escaneos no se pueden analizar.
- La CSP necesita `worker-src 'self' blob:` para el worker de pdfjs.
- El server no puede verificar que el texto venga de un PDF: lo trata como entrada externa cualquiera.

## Cómo se verifica
Lectura de `components/FileUpload.tsx` y `lib/pdf-extract.ts`: no hay `FormData` ni subida de archivos. Sin test automático (es código de navegador).
