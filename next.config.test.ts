import { describe, expect, it } from "vitest";
import nextConfig from "./next.config.mjs";

describe("headers de seguridad", () => {
  it("L1: la CSP cierra base-uri, form-action y object-src, y no deja embeber el sitio", async () => {
    const [{ headers }] = await nextConfig.headers();
    const csp = headers.find((h: { key: string }) => h.key === "Content-Security-Policy").value;
    for (const directiva of ["base-uri 'none'", "form-action 'self'", "object-src 'none'", "frame-ancestors 'none'"]) {
      expect(csp).toContain(directiva);
    }
  });
});
