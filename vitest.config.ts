import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
  },
  esbuild: {
    jsx: "automatic",
  },
  test: {
    environment: "node",
    pool: "forks",
    isolate: true,
    fileParallelism: true,
    maxWorkers: 4,
    testTimeout: 5000,
    include: [
      "apps/api/tests/**/*.test.ts",
      "packages/contracts/src/**/*.test.ts",
      "apps/web/src/**/*.test.ts",
      "apps/web/src/**/*.test.tsx",
      "scripts/**/*.test.mjs",
      "scripts/**/*.test.ts",
    ],
  },
});
