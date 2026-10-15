import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Unit/integration tests live next to the code; Playwright specs live in e2e/
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "node",
  },
})
