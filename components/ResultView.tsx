import { AnalysisResult, Certeza } from "@/lib/types";

function BadgeCerteza({ certeza }: { certeza: Certeza }) {
  if (certeza === "alta") return null;
  return (
    <span className="ml-2 inline-block rounded-full bg-ink/10 px-2 py-0.5 text-[11px] font-medium text-ink/60">
      A verificar
    </span>
  );
}

function Card({
  titulo,
  explicacion,
  articulo,
  articuloVerificado,
  certeza,
  tono,
}: {
  titulo: string;
  explicacion: string;
  articulo?: string;
  articuloVerificado?: boolean;
  certeza: Certeza;
  tono: "neutral" | "amber";
}) {
  const border =
    tono === "amber" ? "border-amber-300 dark:border-amber-800/60" : "border-ink/10";
  const bg = tono === "amber" ? "bg-amber-50 dark:bg-amber-950/30" : "bg-surface";
  return (
    <div className={`rounded-lg border ${border} ${bg} p-4`}>
      <p className="font-medium text-ink">
        {titulo}
        <BadgeCerteza certeza={certeza} />
      </p>
      <p className="mt-1 text-sm text-ink/70">{explicacion}</p>
      {articulo && (
        <p className="mt-2 text-xs text-ink/50">
          Referencia: {articulo}
          {!articuloVerificado && (
            <span className="ml-1.5 text-ink/40">
              (cita generada por IA, no verificada automáticamente — confirmá el texto vigente)
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export default function ResultView({ result }: { result: AnalysisResult }) {
  if (result.estado === "insuficiente") {
    return (
      <div className="rounded-lg border border-ink/10 bg-surface p-5 text-sm text-ink/70">
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
        <div className="rounded-lg border border-ink/10 bg-surface p-4 text-sm text-ink/70">
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
