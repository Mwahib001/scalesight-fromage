import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["tests/*.test.ts"] },
  server: { port: 3100, host: "0.0.0.0" },
  preview: { port: 3100, host: "0.0.0.0" },
});
