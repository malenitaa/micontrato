import { describe, expect, it } from "vitest";
import { smvmVigente, SMVM_ESCALONES } from "../../lib/legal-data";
import { esArticuloVerificable as v } from "../../lib/legal-context/articulos-validos";

describe("smvmVigente", () => {
  it("Date inválida tira RangeError (aceptado)", () => {
    // Expectativa corregida en el cierre: todos los llamados usan `new Date()`,
    // así que una fecha inválida no puede llegar. Se documenta el comportamiento
    // en vez de agregar manejo para un caso imposible.
    expect(() => smvmVigente(new Date("x"))).toThrow(RangeError);
  });
  it("año 1900 devuelve el primer escalón", () => {
    expect(smvmVigente(new Date("1900-01-01T12:00:00Z"))).toBe(SMVM_ESCALONES[0]);
  });
  it("año 9999 devuelve el último escalón (valor vencido, documenta)", () => {
    expect(smvmVigente(new Date("9999-01-01T12:00:00Z"))).toBe(SMVM_ESCALONES.at(-1));
  });
  it("medianoche argentina: 23:59:59-03 del 31/10 es octubre; 00:00:00-03 del 1/11 es noviembre", () => {
    expect(smvmVigente(new Date("2026-10-31T23:59:59-03:00")).vigenteDesde).toBe("2026-10-01");
    expect(smvmVigente(new Date("2026-11-01T00:00:00-03:00")).vigenteDesde).toBe("2026-11-01");
  });
  it("02:59:59Z del 1/11 todavía es octubre en Argentina (UTC no manda)", () => {
    expect(smvmVigente(new Date("2026-11-01T02:59:59Z")).vigenteDesde).toBe("2026-10-01");
    expect(smvmVigente(new Date("2026-11-01T03:00:00Z")).vigenteDesde).toBe("2026-11-01");
  });
});

describe("esArticuloVerificable", () => {
  it("string de 1.000.000 de caracteres termina rápido", () => {
    const t0 = Date.now();
    v("laboral", "Art. " + "1 ".repeat(500_000));
    v("laboral", "a".repeat(1_000_000));
    v("laboral", "Art. " + "9".repeat(1_000_000));
    expect(Date.now() - t0).toBeLessThan(2000);
  });
  it("cita con espacios en blanco gigantes antes de bis no es patológica", () => {
    const t0 = Date.now();
    v("laboral", "Art. 92" + " ".repeat(100_000) + "x");
    expect(Date.now() - t0).toBeLessThan(2000);
  });
  it("vacío y solo espacios -> false", () => {
    expect(v("laboral", "")).toBe(false);
    expect(v("laboral", "   ")).toBe(false);
  });
  it("undefined/null no tira (el modelo puede omitir el campo)", () => {
    // Rompe: parsearCita llama cita.search sobre undefined -> TypeError.
    expect(() => v("laboral", undefined as unknown as string)).not.toThrow();
    expect(() => v("laboral", null as unknown as string)).not.toThrow();
  });
  it("número con muchos dígitos no matchea", () => {
    expect(v("laboral", "Art. 245" + "0".repeat(50))).toBe(false);
  });
  it("'Art. 245 bis bis' no se valida", () => {
    expect(v("laboral", "Art. 245 bis bis")).toBe(false);
  });
  it("'Art. 245 bis' no se valida (245 existe, 245 bis no)", () => {
    expect(v("laboral", "Art. 245 bis")).toBe(false);
  });
  it("minúsculas y variantes: 'art. 245 ley 20.744', 'ART 92 BIS LCT'", () => {
    expect(v("laboral", "art. 245 ley 20.744")).toBe(true);
    expect(v("laboral", "ART 92 BIS LCT")).toBe(true);
  });
  it("'Ley' sin número -> false", () => {
    expect(v("laboral", "Ley")).toBe(false);
    // Expectativa corregida en el cierre: una "Ley" que no se puede leer ya no
    // hereda la ley por defecto (mismo criterio que "Ley de Sociedades").
    expect(v("laboral", "Art. 245, Ley")).toBe(false);
  });
  it("ley de otro régimen con artículo de la LCT no verifica", () => {
    expect(v("laboral", "Art. 245, Ley 24.240")).toBe(false);
    expect(v("consumidor", "Art. 245")).toBe(false);
  });
  it("lista de artículos: 'Arts. 245 y 999' falla por uno inválido", () => {
    expect(v("laboral", "Arts. 245 y 999, LCT")).toBe(false);
    expect(v("laboral", "Arts. 245 y 246, LCT")).toBe(false);
    expect(v("laboral", "Arts. 245 y 58, LCT")).toBe(true);
  });
  it("cita con la palabra 'ley' en el medio no confunde: 'Art. 245 de la Ley de Contrato de Trabajo'", () => {
    expect(v("laboral", "Art. 245 de la Ley de Contrato de Trabajo")).toBe(true);
  });
  it("número de artículo pegado a la ley: 'Art. 245 Ley 20.744' vs '20744'", () => {
    // Rompe (probable): "20744" sin punto -> regex acepta \d{1,2}\.?\d{3}, debería ser válido.
    expect(v("laboral", "Art. 245, Ley 20744")).toBe(true);
  });
  it("número de ley 'falso' que contiene uno válido: 'Ley 120.744' no verifica", () => {
    expect(v("laboral", "Art. 245, Ley 120.744")).toBe(false);
  });
  it("artículo 'ley 24.013 art. 8' (orden invertido) -> ", () => {
    // Rompe: lo anterior a "ley" queda vacío, los artículos se pierden y valida solo por la ley.
    expect(v("laboral", "Ley 24.013 art. 999")).toBe(false);
  });
  it("cita con 'Art.' pero sin número legible no se verifica como si fuera la ley sola", () => {
    // Rompe: sin dígitos ASCII, articulos queda [] y se valida solo por la ley (LCT) -> "verificada". Discutible: la expectativa es mía.
    // Expectativa corregida en el cierre: los dígitos de ancho completo se
    // normalizan (NFKC) y "Art. 245 LCT" es una cita real del contexto.
    expect(v("laboral", "Art. ２４５ LCT")).toBe(true);
    expect(v("laboral", "Art. cuarenta y cinco LCT")).toBe(false);
  });
  it("ley no reconocida ('Ley de Sociedades') no hereda la ley por defecto", () => {
    // Rompe: sin número ni alias, ley=null y se usa 20.744 por defecto -> artículo 245 de OTRA ley sale "verificado".
    expect(v("laboral", "Art. 245 de la Ley de Sociedades")).toBe(false);
  });
});
