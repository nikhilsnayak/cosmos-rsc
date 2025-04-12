import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";

export default defineConfig([
  {
    ignores: [".cosmos-rsc/"],
  },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  { files: ["**/*.js"], plugins: { js }, extends: ["js/recommended"] },
  {
    files: ["**/*.js"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  reactHooks.configs["recommended-latest"],
  reactCompiler.configs.recommended,
  {
    rules: {
      "react/prop-types": "off",
      "react-compiler/react-compiler": "error",
    },
  },
  eslintConfigPrettier,
]);
