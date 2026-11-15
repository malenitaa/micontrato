import Link from "next/link";
import { SMVM_LINK_VERIFICACION, smvmVigente } from "@/lib/legal-data";

// El SMVM vigente depende de la fecha: se regenera cada hora en vez de quedar fijo al build.
export const revalidate = 3600;

export const metadata = {
  title: "Fuentes — MiContrato",
};

export default function FuentesPage() {
  const smvm = smvmVigente();
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink/80">
        ← Volver
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-ink">
        ¿De dónde sale esta información?
      </h1>

      <div className="mt-6 space-y-6 text-sm text-ink/80">
        <p>
          La app no busca en internet en el momento ni consulta una base de
          datos jurídica en vivo. Usa dos cosas para generar cada análisis:
          un resumen de la ley escrito y curado a mano (no generado por IA),
          y un modelo de lenguaje de Anthropic (Claude) que lo aplica a tu
          documento y tu contexto.
        </p>

        <section>
          <h2 className="font-medium text-ink">Modo Laboral</h2>
          <p className="mt-1">
            Basado en la Ley de Contrato de Trabajo (Ley 20.744). Texto
            oficial de referencia:{" "}
            <a
              href="https://www.argentina.gob.ar/normativa/nacional/25552/actualizacion"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-ink"
            >
              argentina.gob.ar/normativa/nacional/25552
            </a>
            . Algunos puntos (período de prueba, multas por falta de
            registración, cálculo de indemnización) fueron modificados por
            reformas de 2024 y 2026 que no pudimos verificar línea por línea
            contra el texto oficial — en esos casos la app te lo avisa
            explícitamente en vez de afirmar una cifra.
          </p>
        </section>

        <section>
          <h2 className="font-medium text-ink">Modo Consumidor</h2>
          <p className="mt-1">
            Basado en la Ley de Defensa del Consumidor (Ley 24.240). Texto
            oficial de referencia:{" "}
            <a
              href="https://www.argentina.gob.ar/normativa/nacional/ley-24240-638/actualizacion"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-ink"
            >
              argentina.gob.ar/normativa/nacional/ley-24240-638
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-medium text-ink">
            Salario Mínimo, Vital y Móvil (SMVM)
          </h2>
          <p className="mt-1">
            Valor usado: ${smvm.valorMensual.toLocaleString("es-AR")}{" "}
            mensuales, vigente desde {smvm.vigenteDesde}. Fuente: {smvm.fuente}
            . Como este monto cambia periódicamente, podés verificar el valor
            actualizado en{" "}
            <a
              href={SMVM_LINK_VERIFICACION}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-ink"
            >
              {SMVM_LINK_VERIFICACION}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-medium text-ink">El modelo de IA</h2>
          <p className="mt-1">
            El análisis de tu documento lo genera un modelo de lenguaje de
            Anthropic (Claude), guiado por el resumen legal de arriba. Puede
            cometer errores u omisiones, así que no reemplaza la lectura de
            un profesional — es una primera orientación, no un dictamen.
          </p>
        </section>
      </div>
    </main>
  );
}
