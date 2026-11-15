import { describe, expect, it } from "vitest";
import { esArticuloVerificable } from "./articulos-validos";

describe("esArticuloVerificable", () => {
  describe("citas que no están en el contexto curado → false", () => {
    it.each([
      ["laboral", "Art. 999, Ley 20.744"],
      ["consumidor", "Art. 4, Ley 24.240"],
      ["consumidor", "Art. 87"],
      ["laboral", "Art. 87"],
      ["laboral", "Art. 24, Ley 20.744"], // contiene "Art. 2"... y "Ley 20.744"
      ["laboral", "Art. 245, Ley 24.240"], // artículo real, ley equivocada
      ["consumidor", "Art. 245, Ley 20.744"], // ley de otro modo
      ["laboral", "Arts. 131 y 999, Ley 20.744"], // uno de los dos no existe
      ["laboral", "Ley 99.999"],
      ["laboral", "Ley 23.660/23.661"],
      ["laboral", "sin cita"],
      ["laboral", ""],
    ] as const)("%s: %s", (modo, cita) => {
      expect(esArticuloVerificable(modo, cita)).toBe(false);
    });
  });

  describe("citas reales del contexto → true", () => {
    it.each([
      ["laboral", "Art. 245, Ley 20.744"],
      ["laboral", "Art. 92 bis, Ley 20.744"],
      ["laboral", "Art. 92 bis LCT"],
      ["laboral", "Art. 201 de la Ley de Contrato de Trabajo"],
      ["laboral", "Arts. 131 y 133, Ley 20.744"],
      ["laboral", "Art. 8, Ley 24.013"],
      ["laboral", "Art. 1, Ley 25.323"],
      ["laboral", "Art. 150"], // sin ley: se asume la LCT
      ["laboral", "Ley 23.041"],
      ["laboral", "Ley 27.802 (ver texto vigente)"],
      ["consumidor", "Art. 11, Ley 24.240"],
      ["consumidor", "Art. 37 Ley 24240"],
      ["consumidor", "Art. 34"], // sin ley: se asume la 24.240
      ["consumidor", "Ley 24.240 (ver texto vigente)"],
    ] as const)("%s: %s", (modo, cita) => {
      expect(esArticuloVerificable(modo, cita)).toBe(true);
    });
  });
});
