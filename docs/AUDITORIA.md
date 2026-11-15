# Auditoría de seguridad y privacidad — MiContrato

**Fecha:** 15/11/2026 · **Versión revisada:** commit `424ad46` (tag `v0.1.1`), con las correcciones en la rama `chore/cierre-proyecto` · **Alcance:**
- el endpoint `POST /api/analyze`;
- los prompts y el contexto legal;
- la validación de citas y el salario mínimo;
- la UI que renderiza la salida del modelo;
- los headers y la CSP;
- las dependencias, la CI y el historial de git.

**Qué es y qué no es.** Es una autoevaluación técnica: una revisión independiente del código (hecha por un agente que no escribió el código), chequeos automáticos y pruebas con el SDK mockeado. **No** es una certificación ni una auditoría de un tercero acreditado.

## Resumen

| Severidad | Encontrados | Corregidos | Aceptados (con justificación) |
|---|---|---|---|
| Crítica | 0 | — | — |
| Alta | 1 | 1 | — |
| Media | 4 | 3 | 1 (M4) |
| Baja | 5 | 5 | — |

Además, la prueba de peor caso encontró 18 tests que fallaban: 15 corregidos en el código y 3 con la expectativa del test corregida (ver "Peor caso").

**Chequeos automáticos** (salida literal):

```
$ npm audit --omit=dev
found 0 vulnerabilities
$ npm audit
found 0 vulnerabilities
```

**Historial de git:** `gitleaks git --log-opts="--all"` (8.30.1): `18 commits scanned ... no leaks found`, y lo mismo sobre un clon espejo con las refs de PR. `git log -p --all | grep -E 'sk-ant-'` no da coincidencias. El único archivo de entorno que pasó por el historial es `.env.example` (vacío).

## Hallazgos

### [A1] Un tercero podía cerrar el delimitador y dejar instrucciones fuera de las etiquetas
**Dónde:** `app/api/analyze/route.ts`, en `buildUserContent()` · **Estado:** corregido
**Evidencia:** un texto con `</documento>` o `</contexto_usuario>`, o un nombre de archivo con `>` y saltos de línea, cerraba el bloque. pdfjs extrae el texto invisible (render mode 3, 1 pt blanco) de un PDF armado para la prueba, así que el que emite el contrato puede esconder la instrucción.
**Riesgo:** un "todo en regla" con certeza alta inducido por quien redactó el documento. No se verificó si Haiku obedece la inyección (requiere la API).
**Corrección:**
- el contenido y el nombre se normalizan con NFKC y **todos** los `<`/`>` pasan a `‹`/`›`;
- el nombre queda en una sola línea;
- el turno del usuario cierra con una instrucción fija.

**Test:** `app/api/analyze/route.test.ts` › A1 (variantes con espacio, salto de línea, ZWSP, ancho completo y nombre de archivo) y `tests/peor-caso/route.test.ts`.

### [M1] Una cita a un artículo reformado salía "verificada" y con certeza alta
**Dónde:** `lib/legal-context/articulos-validos.ts`, `app/api/analyze/route.ts` · **Estado:** corregido
**Evidencia:** "Art. 8, Ley 24.013" (multa que `laboral.md` da por probablemente derogada) salía `articuloVerificado: true` y `certeza: "alta"`, sin ninguna advertencia en pantalla.
**Corrección:** `ARTICULOS_REFORMADOS_LABORAL` y `esArticuloReformado()`. El server fuerza `certeza: "requiere_verificacion"` en toda irregularidad cuya cita no esté verificada o sea de un artículo reformado (ADR-0007).
**Test:** `route.test.ts` › M1 y `articulos-validos.test.ts` › esArticuloReformado.

### [M2] La whitelist de citas se esquivaba con formatos comunes
**Dónde:** `lib/legal-context/articulos-validos.ts` · **Estado:** corregido
**Evidencia:** "Ley 20.744, Art. 999", "LCT art. 999" y "Art. 245, Ley 20.744; Art. 999, Ley 20.744" daban `true`.
**Corrección:** cada parte de la cita va desde su marca ("Art."/"Ley") hasta la otra, en cualquier orden. Las citas separadas por ";" se evalúan una por una. Una ley ilegible no hereda la ley por defecto.
**Test:** `articulos-validos.test.ts` y `tests/peor-caso/legal.test.ts`.

### [M3] El salario mínimo vencía en silencio después del último escalón
**Dónde:** `lib/legal-data.ts`, `lib/prompts.ts`, `.github/workflows/ci.yml` · **Estado:** corregido
**Corrección:**
- `smvmPosiblementeVencido()`: desde el mes siguiente al último escalón cargado, el prompt avisa que el valor puede estar desactualizado y pide "requiere_verificacion";
- un test canario falla cuando la tabla no cubre el mes de hoy;
- la CI corre también todos los lunes (`schedule`).

**Test:** `lib/legal-data.test.ts` › smvmPosiblementeVencido y `lib/prompts.test.ts`.

### [M4] El límite de entrada se mide en caracteres, no en tokens, y el SDK reintenta
**Dónde:** `app/api/analyze/route.ts` (`MAX_TOTAL_CHARS`, `maxRetries: 2`) · **Estado:** aceptado
**Evidencia:** 119.000 caracteres CJK pasan el límite. Con escrituras no latinas se acerca a un token por carácter. El SDK reintenta hasta 2 veces en timeouts y 5xx.
**Por qué se acepta:** el techo de gasto es el saldo prepago con la recarga apagada (ADR-0005). Un pedido así cuesta centavos. Los reintentos mejoran la experiencia de quien usa el sitio de verdad.

### [L1] La CSP no tenía `base-uri`, `form-action` ni `object-src`
**Dónde:** `next.config.mjs` · **Estado:** corregido (se sumaron `base-uri 'none'`, `form-action 'self'` y `object-src 'none'`)
**Test:** `next.config.test.ts`.
`script-src 'unsafe-inline'` queda: Next mete scripts inline en el HTML prerenderizado, y sacarlo exige nonces y render dinámico. No se encontró vector de inyección HTML (ver Informativo).

### [L2] Entradas o salidas mal formadas tiraban 500 o rompían el render
**Dónde:** `app/api/analyze/route.ts` · **Estado:** corregido
**Evidencia:**
- body `null`, `documentos: [null]`, el modelo devolviendo `null` o una irregularidad sin `articulo`: todo eso daba `TypeError` y un 500;
- `{"estado":"ok"}` sin listas hacía explotar `result.enRegla.length` en el cliente.

**Corrección:** 400 para body o documentos que no son objetos. Las listas del modelo se normalizan a arrays de objetos, y `articulo` a string.
**Test:** `route.test.ts` › L2 y `tests/peor-caso/route.test.ts` › respuestas raras del modelo.

### [L3] `stop_reason: "max_tokens"` daba un 502 genérico
**Estado:** corregido: ahora el mensaje dice que el análisis salió demasiado largo · **Test:** `route.test.ts` › L3.

### [L4] El texto de privacidad no coincidía con el código
**Estado:** corregido. El README dice que también viaja el nombre del archivo, y la portada ya no dice "por default", que sugería un modo con guardado que no existe.

### [L5] El README prometía licencia MIT y no había `LICENSE`
**Estado:** corregido: `LICENSE` (MIT) y `"license": "MIT"` en `package.json`.

## Peor caso (rompedora)

59 tests en `tests/peor-caso/`; fallaban 18.
- **Corregidos en el código:**
  - body y documentos `null`;
  - delimitadores en nombre, texto y contexto;
  - respuestas `null`, sin `articulo` o con listas que no son arrays;
  - el reloj que vuelve atrás en el rate limit;
  - `articulo` `undefined`;
  - "Ley 120.744", "Ley de Sociedades", la ley antes del artículo, y "Art." sin número.
- **Expectativa del test corregida, con comentario en el test:**
  - `smvmVigente(new Date("x"))` tira `RangeError`: todos los llamados usan `new Date()`, así que una fecha inválida no puede llegar;
  - "Art. ２４５ LCT" ahora es `true`: los dígitos de ancho completo se normalizan y es una cita real;
  - rotar `x-forwarded-for` no frena el rate limit fuera de Vercel; en producción la plataforma reescribe el header con la IP real.

## Aceptados con justificación

| # | Qué | Por qué se acepta | Cuándo se revisa |
|---|---|---|---|
| M4 | Límite en caracteres y reintentos del SDK | Techo de gasto = saldo prepago (ADR-0005) | Si se activa la recarga automática o crece el tráfico |
| — | Rate limit en memoria, por instancia, y `Map` que no borra IPs inactivas | Decisión del issue #3 (ADR-0005); en serverless las instancias se reciclan | Igual que M4 |
| — | `script-src 'unsafe-inline'` | Lo requiere Next sin nonces; no hay vector de inyección HTML | Si se agrega HTML de terceros |

## Informativo

1. **XSS por la salida del modelo:** no se encontró vector. El único `href` dinámico sale de `RECURSOS_*`, constantes del server que se asignan después del spread de la respuesta del modelo. No hay `dangerouslySetInnerHTML` ni `innerHTML`.
2. **Logs:** se loguea el error del SDK, que trae status y headers de la respuesta, no el prompt. Si alguien define `ANTHROPIC_LOG=debug` en Vercel, el SDK loguea el body del pedido con los datos personales: no definirla (anotado en `SECURITY.md`).
3. **Código muerto:** `route.ts` repite el chequeo de `MAX_DOCUMENTOS` y la segunda vez nunca se ejecuta. No se tocó.
4. **Supply chain:**
   - el lockfile resuelve todo desde `registry.npmjs.org`, con `integrity`;
   - el único `hasInstallScript` es `fsevents`, opcional, y lo bloquea `ignore-scripts`;
   - las actions están fijadas por SHA, con `permissions: contents: read` y `persist-credentials: false`;
   - la CI no tiene secretos y no usa `pull_request_target`.
5. **Build:** ni la clave ni el system prompt aparecen en `.next/static`, y no hay source maps públicos.

## Qué no se revisó

- Si Haiku 4.5 obedece las inyecciones de A1, y el conteo real de tokens (requieren la API).
- La configuración de Vercel: variables de entorno (incluida `ANTHROPIC_LOG`), logs, `maxDuration`, si respeta `.npmrc`, y si reescribe `x-forwarded-for` (según la documentación de Vercel, sí; no se probó).
- Si un intento cortado por timeout se factura igual.
- Los teléfonos de `RECURSOS_*` y que `laboral.md` refleje el texto vigente de las Leyes 27.742 y 27.802.
- Los PR abiertos de Dependabot.
