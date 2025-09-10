// Flat config style (ESLint v9+ / Vite projects)
import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vue from "eslint-plugin-vue";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.vue"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": ts,
      vue,
    },
    rules: {
      // Example: allow 'any[]' generic with ref
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
