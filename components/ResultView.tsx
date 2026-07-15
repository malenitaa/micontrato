import { AnalysisResult } from "@/lib/types";

function Card({
  titulo,
  explicacion,
  articulo,
  tono,
}: {
  titulo: string;
  explicacion: string;
  articulo?: string;
  tono: "neutral" | "amber";
}) {
  const border = tono === "amber" ? "border-amber-300" : "border-ink/10";
  const bg = tono === "amber" ? "bg-amber-50" : "bg-white";
  return (
    <div className={`rounded-lg border ${border} ${bg} p-4`}>
      <p className="font-medium text-ink">{titulo}</p>
      <p className="mt-1 text-sm text-ink/70">{explicacion}</p>
      {articulo && (
        <p className="mt-2 text-xs text-ink/50">Referencia: {articulo}</p>
      )}
    </div>
  );
}

export default function ResultView({ result }: { result: AnalysisResult }) {
  if (result.estado === "insuficiente") {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-5 text-sm text-ink/70">
        <p className="font-medium text-ink">No tenemos suficiente información</p>
        <p className="mt-1">{result.notaInsuficiente}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {result.enRegla.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">
            Lo que está en regla
          </h2>
          <div className="space-y-2">
            {result.enRegla.map((item, i) => (
              <Card key={i} tono="neutral" {...item} />
            ))}
          </div>
        </section>
      )}

      {result.irregularidades.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">
            Posibles irregularidades
          </h2>
          <div className="space-y-2">
            {result.irregularidades.map((item, i) => (
              <Card key={i} tono="amber" {...item} />
            ))}
          </div>
        </section>
      )}

      {result.derechos.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink/50">
            Tus derechos básicos en esta situación
          </h2>
          <div className="space-y-2">
            {result.derechos.map((item, i) => (
              <Card key={i} tono="neutral" {...item} />
            ))}
          </div>
        </section>
      )}

      {result.irregularidades.length === 0 && (
        <div className="rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/70">
          No detectamos irregularidades frecuentes con la información
          disponible. Esto no garantiza que todo esté en orden — es una
          primera lectura, no un análisis exhaustivo.
        </div>
      )}

      {result.recursos && (
        <section className="rounded-lg border border-ink/10 bg-ink/[0.03] p-4 text-sm">
          <h2 className="mb-2 font-semibold text-ink">
            Puede ser buena idea consultar con un profesional
          </h2>
          <ul className="list-inside list-disc space-y-1.5 text-ink/80">
            {result.recursos.items.map((r, i) => (
              <li key={i}>
                {r.url ? (
                  <>
                    {r.texto}:{" "}
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-ink"
                    >
                      {r.url}
                    </a>
                  </>
                ) : (
                  r.texto
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink/50">{result.recursos.nota}</p>
        </section>
      )}
    </div>
  );
}
