export interface ExtractResult {
  texto: string;
  illegible: boolean;
  /** motivo específico del fallo, si se pudo determinar (ej. contraseña) */
  motivo?: "protegido" | "corrupto" | "escaneado";
}

/**
 * Extrae texto de un PDF enteramente en el navegador — el archivo original
 * nunca se sube a ningún servidor, solo el texto extraído.
 */
export async function extraerTextoPdf(file: File): Promise<ExtractResult> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buffer = await file.arrayBuffer();

  let doc;
  try {
    doc = await pdfjs.getDocument({ data: buffer }).promise;
  } catch (e) {
    // pdfjs lanza PasswordException para PDFs protegidos con contraseña.
    const nombre = e instanceof Error ? e.name : "";
    if (nombre === "PasswordException") {
      return { texto: "", illegible: true, motivo: "protegido" };
    }
    return { texto: "", illegible: true, motivo: "corrupto" };
  }

  let texto = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    texto += pageText + "\n";
  }

  const limpio = texto.trim();
  // Un PDF escaneado (imagen) devuelve texto vacío o casi vacío por página.
  const illegible = limpio.length < 20;

  return { texto: limpio, illegible, motivo: illegible ? "escaneado" : undefined };
}
