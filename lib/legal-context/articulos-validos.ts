import { Modo } from "../types";

/**
 * Leyes y artículos que el contexto legal curado (laboral.md / consumidor.md)
 * efectivamente menciona por número. Se usa para marcar como "no verificada"
 * cualquier cita del modelo que no esté acá — el modelo puede citar mal un
 * artículo pese a las instrucciones del prompt, y esto evita mostrarlo con la
 * misma confianza que una cita real.
 *
 * Clave: número de ley con punto ("20.744"). Valor: artículos citados del
 * contexto (vacío si el contexto menciona la ley pero ningún artículo suyo).
 */
type Whitelist = Record<string, string[]>;

export const ARTICULOS_VALIDOS_LABORAL: Whitelist = {
  "20.744": ["58", "92 bis", "131", "133", "150", "158", "196", "201", "245"],
  "24.013": ["8", "9", "10"],
  "25.323": ["1"],
  "23.041": [],
  "27.742": [],
  "27.802": [],
  "11.544": [],
};

export const ARTICULOS_VALIDOS_CONSUMIDOR: Whitelist = {
  "24.240": ["8", "11", "17", "19", "34", "35", "37"],
};

/** Ley que se asume cuando la cita trae el artículo sin ley ("Art. 245"). */
const LEY_POR_DEFECTO: Record<Modo, string> = {
  laboral: "20.744",
  consumidor: "24.240",
};

const ALIAS_LEY: [RegExp, string][] = [
  [/\bLCT\b|ley de contrato de trabajo/i, "20.744"],
  [/\bLDC\b|ley de defensa del consumidor/i, "24.240"],
];

interface Cita {
  articulos: string[];
  ley: string | null;
}

/** "Art. 245, Ley 20.744" → { articulos: ["245"], ley: "20.744" }. */
function parsearCita(cita: string): Cita {
  // Lo que viene antes de la ley son los artículos; lo de después, la ley.
  const marcaLey = cita.search(/\bley\b|\bLCT\b|\bLDC\b/i);
  const parteArticulos = marcaLey === -1 ? cita : cita.slice(0, marcaLey);
  const parteLey = marcaLey === -1 ? "" : cita.slice(marcaLey);

  const articulos = /\bart/i.test(parteArticulos)
    ? Array.from(
        parteArticulos.matchAll(/(\d+)(\s*(?:bis|ter|quater)\b)?/gi),
        (m) => (m[2] ? `${m[1]} ${m[2].trim().toLowerCase()}` : m[1])
      )
    : [];

  let ley: string | null = null;
  const numero = parteLey.match(/\b(\d{1,2})\.?(\d{3})\b/);
  if (numero) {
    ley = `${numero[1]}.${numero[2]}`;
  } else {
    ley = ALIAS_LEY.find(([re]) => re.test(parteLey))?.[1] ?? null;
  }
  return { articulos, ley };
}

export function esArticuloVerificable(modo: Modo, articulo: string): boolean {
  const lista =
    modo === "laboral" ? ARTICULOS_VALIDOS_LABORAL : ARTICULOS_VALIDOS_CONSUMIDOR;
  const { articulos, ley } = parsearCita(articulo);

  if (articulos.length === 0) {
    // Solo la ley, como pide el prompt cuando no hay artículo exacto
    // ("Ley 24.240 (ver texto vigente)").
    return ley !== null && ley in lista;
  }
  const validos = lista[ley ?? LEY_POR_DEFECTO[modo]];
  return validos !== undefined && articulos.every((a) => validos.includes(a));
}
