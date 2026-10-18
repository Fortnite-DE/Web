import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  prettier,
  { rules: { "@typescript-eslint/no-explicit-any": "error" } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
