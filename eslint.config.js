import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type { import("eslint").Linter.FlatConfig[] } */
export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules", "dist"],
    rules: {
      "no-duplicate-imports": "error",
      curly: "error",
      "default-case": "error",
      "default-case-last": "error",
      eqeqeq: "error",
      "no-empty-function": "error",
      "prefer-template": "error",
      "require-await": "error",

      "dot-notation": "warn",
      "no-console": "warn",
    },
  },
];
