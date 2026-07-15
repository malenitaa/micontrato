"use client";

import { useRef, useState } from "react";
import { extraerTextoPdf } from "@/lib/pdf-extract";

export interface DocItem {
  id: string;
  nombre: string;
  texto: string;
  illegible: boolean;
}

interface Props {
  documentos: DocItem[];
  onChange: (docs: DocItem[]) => void;
}

export default function FileUpload({ documentos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [pegarTexto, setPegarTexto] = useState(false);
  const [textoManual, setTextoManual] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setProcesando(true);
    const nuevos: DocItem[] = [];

    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") {
        setError(`"${file.name}" no es un PDF. Subí PDFs o pegá el texto directamente.`);
        continue;
      }
      try {
        const { texto, illegible } = await extraerTextoPdf(file);
        nuevos.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          nombre: file.name,
          texto,
          illegible,
        });
      } catch (e) {
        console.error(e);
        nuevos.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          nombre: file.name,
          texto: "",
          illegible: true,
        });
      }
    }

    onChange([...documentos, ...nuevos]);
    setProcesando(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function agregarTextoManual() {
    if (!textoManual.trim()) return;
    onChange([
      ...documentos,
      {
        id: `manual-${Date.now()}`,
        nombre: "Texto pegado",
        texto: textoManual.trim(),
        illegible: false,
      },
    ]);
    setTextoManual("");
    setPegarTexto(false);
  }

  function quitar(id: string) {
    onChange(documentos.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink/40">
          {procesando ? "Leyendo PDF…" : "Subir PDF"}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            disabled={procesando}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        <button
          type="button"
          onClick={() => setPegarTexto((v) => !v)}
          className="rounded-lg border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink hover:border-ink/40"
        >
          Pegar texto en vez de subir
        </button>
        <span className="text-xs text-ink/50">
          Podés subir más de un documento (ej. contrato + recibo).
        </span>
      </div>

      {error && <p className="text-sm text-amber-700">{error}</p>}

      {pegarTexto && (
        <div className="space-y-2">
          <textarea
            value={textoManual}
            onChange={(e) => setTextoManual(e.target.value)}
            rows={6}
            placeholder="Pegá acá el texto del contrato, recibo o factura…"
            className="w-full rounded-lg border border-ink/20 p-3 text-sm focus:border-ink/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={agregarTextoManual}
            className="rounded-lg bg-ink px-4 py-1.5 text-sm font-medium text-white hover:bg-ink/90"
          >
            Agregar
          </button>
        </div>
      )}

      {documentos.length > 0 && (
        <ul className="space-y-2">
          {documentos.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm"
            >
              <span className="truncate">
                📄 {doc.nombre}
                {doc.illegible && (
                  <span className="ml-2 text-amber-700">
                    (no se pudo leer texto — puede ser un PDF escaneado)
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => quitar(doc.id)}
                className="ml-3 text-ink/40 hover:text-ink/70"
                aria-label="Quitar"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
