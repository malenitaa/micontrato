import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // El mismo alias que tsconfig.json ("@/*" → raíz del repo).
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
});
