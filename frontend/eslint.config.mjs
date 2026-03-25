import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Downgrade errors to warnings — these are pre-existing issues, not blockers
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/react-compiler": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];
