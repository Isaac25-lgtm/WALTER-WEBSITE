import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import globals from "globals";

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/.next-build/**",
      "**/.tmp-web-build/**",
      "**/.tmp-inlining-proof/**",
      "**/.next-stale/**",
      "**/out/**",
      "**/dist/**",
      "context/**",
      "coverage/**",
      "apps/web/src/generated/public-content.json",
    ],
  },
  js.configs.recommended,
  ...nextVitals,
  {
    settings: {
      next: {
        rootDir: "apps/web",
      },
    },
  },
  {
    files: [
      "scripts/**/*.{js,mjs,ts}",
      "vitest.config.ts",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
    },
  },
];

export default eslintConfig;
