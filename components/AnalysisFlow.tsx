"use client";

import { useState } from "react";
import Link from "next/link";
import FileUpload, { DocItem } from "@/components/FileUpload";
import ResultView from "@/components/ResultView";
import { AnalysisResult, Modo } from "@/lib/types";
import { RUBROS_CONSUMIDOR } from "@/lib/legal-data";

interface Props {
  modo: Modo;
}

type EstadoUI = "form" | "cargando" | "resultado" | "error";

export default function AnalysisFlow({ modo }: Props) {
  const [documentos, setDocumentos] = useState<DocItem[]>([]);
  const [contexto, setContexto] = useState("");
  const [rubro, setRubro] = useState("");
  const [estado, setEstado] = useState<EstadoUI>("form");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const titulo = modo === "laboral" ? "Modo Laboral" : "Modo Consumidor";
  const ayudaDocumentos =
    modo === "laboral"
      ? "Subí tu contrato de trabajo y/o recibo de sueldo (podés subir los dos)."
      : "Subí la factura, comprobante o contrato del producto o servicio (podés subir, por ejemplo, la oferta y la factura juntas).";
  const ayudaContexto =
    modo === "laboral"
      ? "Contanos lo que el documento no dice pero pasa en la práctica: por ejemplo, si cobrás una parte en efectivo, tu categoría real, horas que trabajás de más, etc."
      : "Contanos lo que el documento no dice pero pasa en la práctica: por ejemplo, qué te ofrecieron originalmente, qué cargo no reconocés, etc.";

  async function analizar() {
    setEstado("cargando");
    setErrorMsg("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo,
          documentos: documentos.map((d) => ({
            nombre: d.nombre,
            texto: d.texto,
            illegible: d.illegible,
          })),
          contexto,
          rubro: modo === "consumidor" ? rubro || undefined : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          data.error || "Hubo un error inesperado. Probá de nuevo."
        );
        setEstado("error");
        return;
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      setEstado("resultado");
    } catch (e) {
      console.error(e);
      setErrorMsg(
        "No pudimos conectarnos para analizar el documento. Revisá tu conexión y probá de nuevo."
      );
      setEstado("error");
    }
  }

  function reiniciar() {
    setEstado("form");
    setResult(null);
    setErrorMsg("");
  }

  const puedeAnalizar =
    documentos.some((d) => !d.illegible && d.texto.trim()) ||
    contexto.trim().length > 0;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-ink/50 hover:text-ink/80">
          ← Cambiar modo
        </Link>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/60">
          {titulo}
        </span>
      </div>

      {estado !== "resultado" && (
        <>
          <h1 className="text-2xl font-semibold text-ink">{titulo}</h1>

          <div className="mt-6 space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium text-ink/70">
                {ayudaDocumentos}
              </p>
              <FileUpload documentos={documentos} onChange={setDocumentos} />
            </div>

            {modo === "consumidor" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-ink/70">
                  Rubro (opcional, ayuda a afinar el análisis)
                </label>
                <select
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  className="w-full rounded-lg border border-ink/20 bg-surface p-2.5 text-sm focus:border-ink/40 focus:outline-none"
                >
                  <option value="">Sin especificar</option>
                  {RUBROS_CONSUMIDOR.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-ink/70">
                {ayudaContexto}
              </label>
              <textarea
                value={contexto}
                onChange={(e) => setContexto(e.target.value)}
                rows={4}
                placeholder="Opcional, pero mientras más contexto des, mejor va a poder orientarte."
                className="w-full rounded-lg border border-ink/20 p-3 text-sm focus:border-ink/40 focus:outline-none"
              />
            </div>

            {estado === "error" && (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              disabled={!puedeAnalizar || estado === "cargando"}
              onClick={analizar}
              className="w-full rounded-lg bg-btnbg px-4 py-3 text-sm font-medium text-btnfg transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-btnbg/30"
            >
              {estado === "cargando" ? "Analizando…" : "Analizar"}
            </button>
          </div>
        </>
      )}

      {estado === "resultado" && result && (
        <>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-ink">Resultado</h1>
            <button
              type="button"
              onClick={reiniciar}
              className="text-sm text-ink/50 underline hover:text-ink/80"
            >
              Analizar otro documento
            </button>
          </div>
          <ResultView result={result} />
        </>
      )}
    </main>
  );
}
