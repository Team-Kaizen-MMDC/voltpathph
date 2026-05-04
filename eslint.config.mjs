import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import hooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.turbo/**", "**/build/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Type-checked linting for source files
    files: ["apps/*/src/**/*.{ts,tsx}", "packages/*/src/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": hooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      parserOptions: {
        project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...hooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
  {
    // Non-type-checked linting for config files
    files: ["**/*.config.{js,mjs,ts}", "**/vite.config.ts"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  }
);
