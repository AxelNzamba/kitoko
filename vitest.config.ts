import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: [
        "src/lib/format.ts",
        "src/lib/image.ts",
        "src/lib/csv.ts",
        "src/lib/logger.ts",
        "src/lib/rate-limiter.ts",
        "src/hooks/use-debounce.ts",
        "src/components/ui/pagination.tsx",
      ],
      reporter: ["text", "lcov"],
    },
  },
});
