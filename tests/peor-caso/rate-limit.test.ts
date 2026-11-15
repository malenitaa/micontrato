import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "../../lib/rate-limit";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("checkRateLimit", () => {
  it("5 pasan, el 6to no; vuelve a pasar tras 60s", () => {
    vi.setSystemTime(new Date("2030-01-01T00:00:00Z"));
    for (let i = 0; i < 5; i++) expect(checkRateLimit("a")).toBe(true);
    expect(checkRateLimit("a")).toBe(false);
    vi.advanceTimersByTime(59_999);
    expect(checkRateLimit("a")).toBe(false);
    vi.advanceTimersByTime(1);
    expect(checkRateLimit("a")).toBe(true);
  });

  it("IPs distintas no se pisan", () => {
    vi.setSystemTime(new Date("2031-01-01T00:00:00Z"));
    for (let i = 0; i < 5; i++) checkRateLimit("b");
    expect(checkRateLimit("b")).toBe(false);
    expect(checkRateLimit("c")).toBe(true);
  });

  it("pedidos rechazados no extienden la ventana", () => {
    vi.setSystemTime(new Date("2032-01-01T00:00:00Z"));
    for (let i = 0; i < 5; i++) checkRateLimit("d");
    for (let i = 0; i < 100; i++) { vi.advanceTimersByTime(500); checkRateLimit("d"); }
    vi.advanceTimersByTime(10_000);
    // Rompe si los rechazos se registran: la ventana se corre y 'd' sigue bloqueada.
    expect(checkRateLimit("d")).toBe(true);
  });

  it("el reloj yendo hacia atrás no deja a la IP bloqueada para siempre", () => {
    vi.setSystemTime(new Date("2033-01-01T00:00:00Z"));
    for (let i = 0; i < 5; i++) checkRateLimit("e");
    vi.setSystemTime(new Date("2032-12-31T00:00:00Z")); // atrasado un día
    // Rompe: now - t es negativo (< WINDOW_MS) y los timestamps "futuros" no vencen hasta que el reloj los alcance.
    expect(checkRateLimit("e")).toBe(true);
  });
});
