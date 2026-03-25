const coreWebVitals = require("eslint-config-next/core-web-vitals");
const typescript = require("eslint-config-next/typescript");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/react-compiler": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];
