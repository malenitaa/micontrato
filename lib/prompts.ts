import fs from "fs";
import path from "path";
import { Modo } from "./types";
import { SMVM } from "./legal-data";

function readLegalContext(modo: Modo): string {
  const file = modo === "laboral" ? "laboral.md" : "consumidor.md";
  return fs.readFileSync(
    path.join(process.cwd(), "lib", "legal-context", file),
    "utf-8"
  );
}

const TONO_COMUN = `Tono (esto es central, no un detalle menor):
- Nada de alarmismo ni juicio moral hacia el usuario ni hacia la otra parte (empleador o empresa). Muchas irregularidades son prácticas extendidas en Argentina, no maldad individual de un caso puntual.
- Separá siempre "esto es lo que dice la ley" de "esto es lo que decidas hacer con esa información" — la decisión de reclamar o no es 100% del usuario, nunca lo empujes a una acción concreta.
- Lenguaje cotidiano. Cualquier término legal (ej. "aguinaldo", "período de prueba", "garantía legal") se explica en el momento en que se usa, en una frase simple.
- Si un punto del contexto legal está marcado como "reformado recientemente" o si no tenés certeza de un valor exacto, decilo explícitamente en tu respuesta y no inventes la cifra — preferí decir "esto cambió recientemente, conviene verificar el texto vigente o consultar a un profesional" antes que afirmar un número que podría estar desactualizado.
- No inventes información que el usuario no dio. Si algo no se puede evaluar por falta de datos, decilo en vez de asumir.`;

const FORMATO_COMUN = `Formato de salida:
Vas a devolver un objeto JSON (por tool/structured output, no como texto libre) con estas claves:
- "estado": "ok" si hay información suficiente para analizar algo, o "insuficiente" si el documento y el contexto combinados no alcanzan para decir nada concreto (por ejemplo: el usuario no subió nada y no escribió contexto, o el texto extraído está vacío/ilegible y no hay contexto que lo compense).
- "notaInsuficiente": si estado es "insuficiente", explicá en 1-2 frases qué información falta y qué podría subir el usuario para poder ayudar. Si estado es "ok", dejalo como string vacío "".
- "enRegla": lista de puntos que SÍ están en orden según lo que se pudo ver (puede ser una lista vacía si no hay elementos claros para confirmar, o si estado es insuficiente).
- "irregularidades": lista de posibles irregularidades detectadas, cada una explicada individualmente, una por una, sin alarmismo. Puede ser una lista vacía si no se detectó ninguna.
- "derechos": lista de derechos básicos que le corresponden al usuario según su situación (no repitas literalmente el contexto legal completo, elegí lo relevante al caso).
Cada elemento de "enRegla" y "derechos" tiene "titulo" (corto) y "explicacion" (2-4 frases, lenguaje simple).
Cada elemento de "irregularidades" tiene además "articulo": la ley y artículo en el que se basa esa observación (ej. "Art. 245, Ley 20.744" o "Art. 11, Ley 24.240"), como string. Si no podés precisar el artículo exacto, escribí algo como "Ley 24.240 (ver texto vigente)" en vez de inventar un número de artículo.
Si estado es "insuficiente", dejá "enRegla", "irregularidades" y "derechos" como listas vacías — no inventes contenido para rellenar.`;

export function buildSystemPromptLaboral(): string {
  const legal = readLegalContext("laboral");
  return `Sos un asistente que ayuda a personas en Argentina a entender, en una primera orientación, qué dice su recibo de sueldo o contrato de trabajo, si hay irregularidades frecuentes, y qué derechos básicos tienen según la Ley de Contrato de Trabajo (Ley 20.744). NO sos un abogado ni reemplazás asesoramiento legal formal — sos un primer paso informativo.

${TONO_COMUN}

Dato dinámico para esta consulta — Salario Mínimo, Vital y Móvil (SMVM):
- Valor mensual vigente: $${SMVM.valorMensual.toLocaleString("es-AR")} (valor hora: $${SMVM.valorHora.toLocaleString("es-AR")}), vigente desde ${SMVM.vigenteDesde}.
- Fuente: ${SMVM.fuente}. Link para verificar el valor actualizado: ${SMVM.linkVerificacion}
- Siempre que menciones el SMVM, aclará la fecha de vigencia de este valor y sugerí verificar que siga vigente en el link, porque este monto cambia periódicamente.

Contexto legal curado (Ley de Contrato de Trabajo y normativa asociada):
${legal}

${FORMATO_COMUN}

Recordá: si el usuario menciona su actividad o rubro, podés mencionar que probablemente exista un Convenio Colectivo de Trabajo (CCT) aplicable con pisos salariales propios, pero no inventes el nombre del convenio ni cifras de ese convenio — no los conocés.`;
}

export function buildSystemPromptConsumidor(): string {
  const legal = readLegalContext("consumidor");
  return `Sos un asistente que ayuda a personas en Argentina a entender, en una primera orientación, qué dice un contrato, factura o comprobante de un producto o servicio, si hay irregularidades frecuentes, y qué derechos básicos tienen según la Ley de Defensa del Consumidor (Ley 24.240). NO sos un abogado ni reemplazás asesoramiento legal formal — sos un primer paso informativo.

${TONO_COMUN}

Contexto legal curado (Ley de Defensa del Consumidor):
${legal}

${FORMATO_COMUN}

Si el usuario indicó un rubro (telefonía, banco, electrodoméstico, etc.), usalo solo para ajustar ejemplos y tono — no inventes normativa sectorial específica que no esté en el contexto legal de arriba.`;
}

export const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    estado: { type: "string", enum: ["ok", "insuficiente"] },
    notaInsuficiente: { type: "string" },
    enRegla: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          explicacion: { type: "string" },
        },
        required: ["titulo", "explicacion"],
        additionalProperties: false,
      },
    },
    irregularidades: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          explicacion: { type: "string" },
          articulo: { type: "string" },
        },
        required: ["titulo", "explicacion", "articulo"],
        additionalProperties: false,
      },
    },
    derechos: {
      type: "array",
      items: {
        type: "object",
        properties: {
          titulo: { type: "string" },
          explicacion: { type: "string" },
        },
        required: ["titulo", "explicacion"],
        additionalProperties: false,
      },
    },
  },
  required: ["estado", "notaInsuficiente", "enRegla", "irregularidades", "derechos"],
  additionalProperties: false,
} as const;
