import { describe, expect, it } from "vitest";
import { SMVM_ESCALONES, smvmVigente } from "./legal-data";

// Mediodía en Argentina (UTC-3) para que la fecha no dependa del huso del test.
const enArgentina = (fecha: string) => new Date(`${fecha}T12:00:00-03:00`);

describe("smvmVigente", () => {
  it("2026-11-15: escalón de noviembre de la Res. 4/2026", () => {
    const e = smvmVigente(enArgentina("2026-11-15"));
    expect(e.valorMensual).toBe(398800);
    expect(e.valorHora).toBe(1994);
    expect(e.vigenteDesde).toBe("2026-11-01");
    expect(e.fuente).toContain("4/2026");
  });

  it("2026-07-15: escalón de julio de la Res. 9/2025", () => {
    const e = smvmVigente(enArgentina("2026-07-15"));
    expect(e.valorMensual).toBe(372400);
    expect(e.fuente).toContain("9/2025");
  });

  it("2026-01-15: escalón de enero de la Res. 9/2025", () => {
    expect(smvmVigente(enArgentina("2026-01-15")).valorMensual).toBe(341000);
  });

  it("2025-12-15: escalón de diciembre de la Res. 9/2025", () => {
    expect(smvmVigente(enArgentina("2025-12-15")).valorMensual).toBe(334800);
  });

  it("el primer día del mes ya rige el escalón nuevo", () => {
    expect(smvmVigente(enArgentina("2026-12-01")).valorMensual).toBe(406400);
  });

  it("usa la fecha de Argentina: 30/11 a las 22 h en Argentina ya es 1/12 en UTC", () => {
    const e = smvmVigente(new Date("2026-12-01T01:00:00Z"));
    expect(e.vigenteDesde).toBe("2026-11-01");
  });

  it("después del último escalón conocido devuelve el último", () => {
    expect(smvmVigente(enArgentina("2027-09-01")).vigenteDesde).toBe("2027-04-01");
  });

  it("los escalones están en orden cronológico", () => {
    const fechas = SMVM_ESCALONES.map((e) => e.vigenteDesde);
    expect([...fechas].sort()).toEqual(fechas);
  });
});
