import { Modo } from "../types";

/**
 * Artículos que el contexto legal curado (laboral.md / consumidor.md)
 * efectivamente menciona por número. Se usa para marcar como "no verificada"
 * cualquier cita del modelo que no matchee ninguna de estas entradas —
 * el modelo puede citar mal un artículo pese a las instrucciones del prompt,
 * y esto evita mostrarlo con la misma confianza que una cita real.
 */
export const ARTICULOS_VALIDOS_LABORAL = [
  "Art. 92 bis",
  "Art. 58",
  "Art. 131",
  "Art. 133",
  "Art. 150",
  "Art. 158",
  "Art. 196",
  "Art. 201",
  "Art. 245",
  "Ley 20.744",
  "Ley 24.013",
  "Ley 25.323",
  "Ley 23.041",
  "Ley 27.742",
  "Ley 27.802",
  "Ley 11.544",
];

export const ARTICULOS_VALIDOS_CONSUMIDOR = [
  "Art. 8",
  "Art. 11",
  "Art. 17",
  "Art. 19",
  "Art. 34",
  "Art. 35",
  "Art. 37",
  "Ley 24.240",
];

export function esArticuloVerificable(modo: Modo, articulo: string): boolean {
  const lista =
    modo === "laboral" ? ARTICULOS_VALIDOS_LABORAL : ARTICULOS_VALIDOS_CONSUMIDOR;
  return lista.some((valido) => articulo.includes(valido));
}
