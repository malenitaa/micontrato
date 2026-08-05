# MiContrato

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Web app que ayuda a personas en Argentina a entender, en lenguaje simple, si su
**contrato de trabajo** o su **contrato/factura de consumo** tiene algo irregular,
usando IA para analizarlo a la luz de la ley argentina (Ley de Contrato de Trabajo y
Ley de Defensa del Consumidor).

## ⚠️ Esto NO es asesoramiento legal formal

Esta app da una **primera orientación en lenguaje simple**, generada automáticamente
por un modelo de lenguaje. **No reemplaza la consulta con un abogado, un sindicato, o
el organismo correspondiente**, y puede tener errores u omisiones. Antes de tomar una
decisión concreta (reclamar, no reclamar, firmar algo), consultá con un profesional.
Los resultados de la app siempre cierran con contactos reales para pedir orientación
cuando detectan una irregularidad.

## Cómo se usa

1. Elegís el modo: **Laboral** o **Consumidor**.
2. Subís uno o más PDFs (el archivo nunca sale de tu navegador, solo se envía el
   texto extraído), o pegás el texto directamente.
3. Opcionalmente agregás contexto libre (cosas que el documento no dice pero pasan
   en la práctica).
4. Recibís un resultado en secciones cortas: lo que está en regla, posibles
   irregularidades explicadas una por una, tus derechos básicos, y contactos reales
   para el próximo paso.

## Privacidad

- No hace falta crear cuenta.
- El PDF original nunca sale de tu navegador — solo el texto extraído viaja al
  servidor para generar el análisis.
- Nada se guarda: no hay base de datos, los documentos solo viven en la sesión de
  tu navegador y en el pedido puntual de análisis.
- El texto extraído sí viaja a la API de Claude (Anthropic) para generar el
  análisis, sujeto a su política de retención estándar (ver
  [privacy.anthropic.com](https://privacy.anthropic.com/)).

## Para desarrolladores / correrlo vos mismo

Requisitos: Node.js 20+, y una API key propia de [Anthropic](https://console.anthropic.com/).

```bash
git clone https://github.com/malenitaa/micontrato.git
cd micontrato
npm install
cp .env.example .env.local
# completá ANTHROPIC_API_KEY en .env.local con tu propia API key
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## ¿Te sirvió?

Si te resultó útil y querés bancar el proyecto:

- [Cafecito](https://cafecito.app/rezamalena)
- [Ko-fi](https://ko-fi.com/malenitaa)

## Licencia

MIT — ver [LICENSE](LICENSE).
