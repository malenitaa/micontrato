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

const MARCA_LEY = /\bley\b|\bLCT\b|\bLDC\b/i;
const MARCA_ART = /\bart(?:[ií]culos?|s)?\b/i;

interface Cita {
  /** La cita dice "Art."/"artículo", con o sin número legible. */
  nombraArticulo: boolean;
  articulos: string[];
  /** La cita dice "Ley"/"LCT"/"LDC", se haya podido leer el número o no. */
  nombraLey: boolean;
  ley: string | null;
}

/** "Art. 245, Ley 20.744" → { articulos: ["245"], ley: "20.744", … }. */
function parsearCita(cita: string): Cita {
  // NFKC pasa dígitos de ancho completo ("２４５") a ASCII.
  const texto = cita.normalize("NFKC");
  const iArt = texto.search(MARCA_ART);
  const iLey = texto.search(MARCA_LEY);
  // Cada parte va desde su marca hasta la marca de la otra (si viene después)
  // o hasta el final: así sirve "Art. 8, Ley 24.013" y "Ley 24.013, art. 8".
  const tramo = (desde: number, otra: number) =>
    desde === -1 ? "" : texto.slice(desde, otra > desde ? otra : undefined);
  const parteArticulos = tramo(iArt, iLey);
  const parteLey = tramo(iLey, iArt);

  const articulos = Array.from(
    parteArticulos.matchAll(/(\d+)(\s*(?:bis|ter|quater)\b)?/gi),
    (m) => (m[2] ? `${m[1]} ${m[2].trim().toLowerCase()}` : m[1])
  );

  const numero = parteLey.match(/\b(\d{1,2})\.?(\d{3})\b/);
  const ley = numero
    ? `${numero[1]}.${numero[2]}`
    : ALIAS_LEY.find(([re]) => re.test(parteLey))?.[1] ?? null;

  return { nombraArticulo: iArt !== -1, articulos, nombraLey: iLey !== -1, ley };
}

/**
 * Artículos del contexto curado que `laboral.md` marca como "reformado
 * recientemente" (o que habrían sido derogados): existen en el contexto, pero
 * una cita a ellos nunca puede ir con certeza "alta".
 */
export const ARTICULOS_REFORMADOS_LABORAL: Whitelist = {
  "20.744": ["92 bis", "245"],
  "24.013": ["8", "9", "10"],
  "25.323": ["1"],
};

/** Una cita sola ("Art. 245, Ley 20.744") contra una lista ley → artículos. */
function citaEnLista(modo: Modo, cita: string, lista: Whitelist): boolean {
  const { nombraArticulo, articulos, nombraLey, ley } = parsearCita(cita);

  // Una ley que no se pudo leer ("Ley 120.744", "Ley de Sociedades") no
  // hereda la ley por defecto del modo.
  if (nombraLey && ley === null) return false;
  // "Art." sin número legible no vale como si citara solo la ley.
  if (nombraArticulo && articulos.length === 0) return false;

  if (articulos.length === 0) {
    // Solo la ley, como pide el prompt cuando no hay artículo exacto
    // ("Ley 24.240 (ver texto vigente)").
    return ley !== null && ley in lista;
  }
  const validos = lista[ley ?? LEY_POR_DEFECTO[modo]];
  return validos !== undefined && articulos.every((a) => validos.includes(a));
}

/** Varias citas separadas por ";" se evalúan una por una. */
function citas(articulo: string): string[] {
  return articulo.split(";").filter((c) => c.trim() !== "");
}

export function esArticuloVerificable(modo: Modo, articulo: string): boolean {
  // El modelo puede omitir el campo aunque el schema lo pida.
  if (typeof articulo !== "string") return false;
  const lista =
    modo === "laboral" ? ARTICULOS_VALIDOS_LABORAL : ARTICULOS_VALIDOS_CONSUMIDOR;
  const partes = citas(articulo);
  return partes.length > 0 && partes.every((c) => citaEnLista(modo, c, lista));
}

/** true si alguna de las citas es a un artículo reformado recientemente. */
export function esArticuloReformado(modo: Modo, articulo: string): boolean {
  if (typeof articulo !== "string" || modo !== "laboral") return false;
  return citas(articulo).some((c) => citaEnLista(modo, c, ARTICULOS_REFORMADOS_LABORAL));
}
