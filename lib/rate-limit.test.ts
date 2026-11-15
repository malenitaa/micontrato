import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "./rate-limit";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("checkRateLimit", () => {
  it("CA-11: dada una IP, cuando hace 6 pedidos en un minuto, entonces el sexto se rechaza", () => {
    const resultados = Array.from({ length: 6 }, () => checkRateLimit("1.1.1.1"));
    expect(resultados).toEqual([true, true, true, true, true, false]);
  });

  it("dada una IP frenada, cuando pasa un minuto, entonces vuelve a poder", () => {
    for (let i = 0; i < 6; i++) checkRateLimit("2.2.2.2");
    vi.advanceTimersByTime(60_001);
    expect(checkRateLimit("2.2.2.2")).toBe(true);
  });

  it("dadas dos IPs, cuando una se frena, entonces la otra sigue pudiendo", () => {
    for (let i = 0; i < 6; i++) checkRateLimit("3.3.3.3");
    expect(checkRateLimit("4.4.4.4")).toBe(true);
  });
});
