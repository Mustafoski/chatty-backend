import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["src/**/*.ts"],
    rules: {
      // carry over any rules from your old .eslintrc.json here, e.g.:
      // '@typescript-eslint/no-explicit-any': 'off',
      // 'no-console': 'warn'
    },
  },
);
