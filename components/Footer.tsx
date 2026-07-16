import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 px-4 py-4 text-center">
      <Link
        href="/fuentes"
        className="text-xs text-ink/40 underline hover:text-ink/60"
      >
        ¿De dónde sale esta información?
      </Link>
    </footer>
  );
}
