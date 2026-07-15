import type { Metadata } from "next";
import "./globals.css";
import Disclaimer from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "MiContrato — Entendé tus derechos",
  description:
    "Orientación en lenguaje simple sobre tus derechos laborales y de consumo en Argentina. No reemplaza asesoramiento legal formal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans antialiased">
        <Disclaimer />
        {children}
      </body>
    </html>
  );
}
