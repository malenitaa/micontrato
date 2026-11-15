import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-semibold text-ink">MiContrato</h1>
      <p className="mt-3 max-w-md text-ink/70">
        Subí tu contrato, recibo o factura y te ayudamos a entender, en
        lenguaje simple, qué dice y cuáles son tus derechos. ¿Sobre qué
        situación querés orientación?
      </p>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/laboral"
          className="group flex flex-col items-start gap-2 rounded-xl border border-ink/10 bg-surface p-6 text-left shadow-sm transition hover:border-ink/30 hover:shadow-md"
        >
          <span className="text-2xl">🧾</span>
          <span className="text-lg font-medium text-ink">Laboral</span>
          <span className="text-sm text-ink/60">
            Contrato de trabajo o recibo de sueldo.
          </span>
        </Link>

        <Link
          href="/consumidor"
          className="group flex flex-col items-start gap-2 rounded-xl border border-ink/10 bg-surface p-6 text-left shadow-sm transition hover:border-ink/30 hover:shadow-md"
        >
          <span className="text-2xl">🛒</span>
          <span className="text-lg font-medium text-ink">Consumidor</span>
          <span className="text-sm text-ink/60">
            Factura, comprobante o contrato de un producto o servicio.
          </span>
        </Link>
      </div>

      <p className="mt-10 text-xs text-ink/40">
        No guardamos tus documentos. Nada de esto reemplaza una
        consulta legal formal.
      </p>
    </main>
  );
}
