import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildSystemPromptLaboral,
  buildSystemPromptConsumidor,
  OUTPUT_SCHEMA,
} from "@/lib/prompts";
import { RECURSOS_LABORAL, RECURSOS_CONSUMIDOR } from "@/lib/legal-data";
import { AnalyzeRequest, AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";

const MAX_TOTAL_CHARS = 120_000;

function buildUserContent(body: AnalyzeRequest): string {
  const partes: string[] = [];

  if (body.rubro) {
    partes.push(`Rubro indicado por el usuario: ${body.rubro}`);
  }

  if (body.documentos.length === 0) {
    partes.push("El usuario no adjuntó ningún documento.");
  } else {
    body.documentos.forEach((doc, i) => {
      partes.push(`--- Documento ${i + 1}: "${doc.nombre}" ---`);
      if (doc.illegible || !doc.texto.trim()) {
        partes.push(
          "[No se pudo extraer texto legible de este documento — puede ser un PDF escaneado como imagen, o estar dañado/protegido. No inventes contenido para este documento.]"
        );
      } else {
        partes.push(doc.texto);
      }
    });
  }

  partes.push("--- Contexto adicional que escribió el usuario (puede estar vacío) ---");
  partes.push(body.contexto?.trim() || "(sin contexto adicional)");

  return partes.join("\n\n");
}

export async function POST(req: NextRequest) {
  let body: AnalyzeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida." },
      { status: 400 }
    );
  }

  if (body.modo !== "laboral" && body.modo !== "consumidor") {
    return NextResponse.json({ error: "Modo inválido." }, { status: 400 });
  }

  const documentos = Array.isArray(body.documentos) ? body.documentos : [];
  const contexto = typeof body.contexto === "string" ? body.contexto : "";

  const hayTextoUtil = documentos.some(
    (d) => !d.illegible && d.texto && d.texto.trim().length > 0
  );
  const hayContexto = contexto.trim().length > 0;

  // Guard: sin nada que analizar, no gastamos una llamada al modelo.
  if (!hayTextoUtil && !hayContexto) {
    const result: AnalysisResult = {
      estado: "insuficiente",
      notaInsuficiente:
        "No recibimos ni un documento legible ni contexto escrito. Subí un PDF, pegá el texto del documento, o contanos la situación en el cuadro de texto para poder orientarte.",
      enRegla: [],
      irregularidades: [],
      derechos: [],
      recursos: null,
    };
    return NextResponse.json(result);
  }

  const totalChars =
    documentos.reduce((acc, d) => acc + (d.texto?.length || 0), 0) +
    contexto.length;
  if (totalChars > MAX_TOTAL_CHARS) {
    return NextResponse.json(
      {
        error:
          "El contenido subido es muy extenso para procesarlo de una vez. Probá con un documento más corto, o pegá solo la parte relevante.",
      },
      { status: 413 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Falta configurar ANTHROPIC_API_KEY en el servidor. Revisá el README para correr la app localmente.",
      },
      { status: 500 }
    );
  }

  const system =
    body.modo === "laboral"
      ? buildSystemPromptLaboral()
      : buildSystemPromptConsumidor();

  const userContent = buildUserContent({ ...body, documentos, contexto });

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system,
      output_config: {
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      messages: [{ role: "user", content: userContent }],
    });
  } catch (err) {
    console.error("Error llamando a la API de Claude:", err);
    return NextResponse.json(
      {
        error:
          "Hubo un problema analizando el documento. Probá de nuevo en unos segundos.",
      },
      { status: 502 }
    );
  }

  if (response.stop_reason === "refusal") {
    return NextResponse.json(
      {
        error:
          "No pudimos generar un análisis para este contenido. Si creés que es un error, probá reformular el contexto o subir el documento de otra forma.",
      },
      { status: 422 }
    );
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json(
      { error: "No se pudo interpretar la respuesta del análisis." },
      { status: 502 }
    );
  }

  let parsed: Omit<AnalysisResult, "recursos">;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    return NextResponse.json(
      { error: "No se pudo interpretar la respuesta del análisis." },
      { status: 502 }
    );
  }

  const hayIrregularidades =
    parsed.estado === "ok" && parsed.irregularidades?.length > 0;

  const result: AnalysisResult = {
    ...parsed,
    recursos: hayIrregularidades
      ? body.modo === "laboral"
        ? RECURSOS_LABORAL
        : RECURSOS_CONSUMIDOR
      : null,
  };

  return NextResponse.json(result);
}
