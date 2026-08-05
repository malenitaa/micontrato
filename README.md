# MiContrato

Web app que ayuda a personas en Argentina a entender, en lenguaje simple, dos
situaciones donde suele no quedar claro cuáles son sus derechos:

- **Laboral**: contrato de trabajo o recibo de sueldo (Ley de Contrato de
  Trabajo, Ley 20.744).
- **Consumidor**: factura, comprobante o contrato de un producto o servicio
  (Ley de Defensa del Consumidor, Ley 24.240).

El usuario elige un modo, sube uno o más documentos (o pega el texto), agrega
contexto libre si quiere, y recibe un resultado en secciones cortas: lo que
está en regla, posibles irregularidades explicadas una por una, sus derechos
básicos, y recursos/contactos reales para el próximo paso.

## ⚠️ Esto NO es asesoramiento legal formal

Esta app da una **primera orientación en lenguaje simple**, generada
automáticamente a partir de un modelo de lenguaje (Claude, de Anthropic) y un
resumen curado de la legislación. **No reemplaza la consulta con un abogado,
un sindicato, o el organismo correspondiente**, y puede tener errores u
omisiones — sobre todo en puntos de la ley que cambiaron recientemente (ver
`lib/legal-context/laboral.md`, que señala explícitamente qué partes de la
Ley de Contrato de Trabajo fueron modificadas por reformas de 2024 y 2026 y
todavía no están 100% verificadas contra el texto oficial). El disclaimer
también se muestra de forma visible arriba de toda la app.

Antes de tomar una decisión concreta (reclamar, no reclamar, firmar algo),
consultá con un profesional. Los resultados de la app siempre cierran con
contactos reales para pedir orientación cuando detectan una irregularidad.

## Qué hace

1. El usuario elige modo (Laboral / Consumidor) al entrar.
2. Sube uno o más PDFs, o pega el texto directamente — el texto se extrae
   **en el navegador** (no se sube el archivo original a ningún servidor).
3. Puede agregar contexto libre (cosas que el documento no dice pero pasan en
   la práctica: por ejemplo, una parte del sueldo cobrada en efectivo).
4. En modo Consumidor, puede indicar el rubro para afinar el análisis.
5. El resultado se genera con la API de Claude, usando un system prompt
   distinto por modo que incluye un resumen curado a mano de la ley
   correspondiente (no RAG — ver la sección de arquitectura abajo).
6. Nada se guarda ligado a una identidad real por default: no hay login, y
   los documentos no se persisten en ningún backend — solo viven en la
   sesión del navegador y en la request al analizar.

## Cómo se le da contexto legal al modelo

En vez de RAG o de mandar la ley completa, cada modo tiene un archivo
Markdown curado a mano (`lib/legal-context/laboral.md` y `consumidor.md`)
que resume **solo** los puntos que la app efectivamente detecta, con:

- el artículo/ley de referencia,
- un link a la fuente oficial,
- y, en los puntos donde hubo reformas recientes o no se pudo verificar el
  dato con 100% de certeza, una marca explícita para que el modelo no invente
  cifras y en su lugar remita a verificar el texto vigente.

El valor del Salario Mínimo, Vital y Móvil (que cambia periódicamente) se
inyecta aparte como un dato dinámico (`lib/legal-data.ts`), con su fecha de
vigencia y su fuente, en vez de quedar hardcodeado dentro del resumen legal.

## Manejo de estados

- **Datos insuficientes**: si no se sube ningún documento legible ni se
  escribe contexto, la app no llama al modelo — devuelve directamente un
  estado "insuficiente" pidiendo más información.
- **PDF ilegible / escaneado**: si no se puede extraer texto de un PDF (por
  ejemplo, es una foto/escaneo sin capa de texto), se marca ese documento
  como no legible y se le avisa al usuario, sin inventar contenido para ese
  archivo.
- **Error de análisis**: errores de red o del modelo se muestran como un
  mensaje claro, sin togglear a un resultado falso.

## Stack técnico

- Next.js (App Router) + TypeScript + Tailwind CSS
- `@anthropic-ai/sdk` para el análisis (modelo `claude-haiku-4-5`, salida
  estructurada vía `output_config.format`)
- `pdfjs-dist` para extraer texto de PDFs en el cliente
- Sin base de datos — todo el estado vive en la sesión del navegador

## Cómo correr localmente

Requisitos: Node.js 20+.

```bash
npm install
cp .env.example .env.local
# completá ANTHROPIC_API_KEY en .env.local con tu API key de Anthropic
npm run dev
```

Abrí http://localhost:3000.

## Cómo deployar

Cualquier hosting compatible con Next.js (Vercel, Netlify, un contenedor
propio) sirve. Pasos generales:

1. Configurá la variable de entorno `ANTHROPIC_API_KEY` en el hosting.
2. `npm run build && npm run start` (o el equivalente del hosting elegido).
3. No hace falta configurar ninguna base de datos.

## Privacidad

- Sin login obligatorio para el análisis básico.
- El archivo original del PDF nunca sale del navegador — solo se envía el
  texto extraído al servidor para generar el análisis.
- No se persiste nada en un backend propio: no hay guardado de resultados en
  este MVP (ver "Qué hace" arriba). El backend tampoco loguea el contenido de
  los documentos ni del contexto escrito por el usuario — solo se loguea el
  objeto de error del SDK si la llamada al modelo falla.
- El texto extraído sí viaja a la API de Claude (Anthropic) para generar el
  análisis. Por política estándar de la API comercial de Anthropic, ese
  contenido no se usa para entrenar modelos y se retiene por un plazo acotado
  ligado a abuso/soporte (no indefinidamente) — confirmá el detalle vigente y
  la fecha de verificación en https://privacy.anthropic.com/ antes de asumir
  un comportamiento específico, ya que las políticas pueden cambiar.
- La API tiene un rate limit básico por IP (`lib/rate-limit.ts`, 5 requests
  por minuto) para evitar abuso y costo de API descontrolado. Es en memoria
  del proceso: en un despliegue serverless multi-instancia no se comparte
  entre instancias — para eso conviene un store compartido (ej. Upstash
  Redis) si el tráfico lo justifica.
