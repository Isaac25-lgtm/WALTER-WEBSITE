import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  // Vitest 4 / Vite 8 transform with oxc, not esbuild. apps/web/tsconfig.json sets
  // jsx: "preserve" for Next.js, so the JSX runtime must be set explicitly here or
  // .tsx test files fail to parse.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    environment: "node",
    pool: "forks",
    isolate: true,
    fileParallelism: true,
    maxWorkers: 4,
    testTimeout: 5000,
    include: [
      "apps/web/src/**/*.test.ts",
      "apps/web/src/**/*.test.tsx",
      "scripts/**/*.test.mjs",
      "scripts/**/*.test.ts",
    ],
  },
});
