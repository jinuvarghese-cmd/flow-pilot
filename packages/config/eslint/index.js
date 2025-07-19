module.exports = {
    extends: [
      "eslint:recommended",
      "@typescript-eslint/recommended",
      "prettier"
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    env: {
      node: true,
      jest: true,
    },
    ignorePatterns: [".eslintrc.js", "*.config.js", "*.config.ts"],
    overrides: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
          "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
          "@typescript-eslint/explicit-function-return-type": "off",
          "@typescript-eslint/explicit-module-boundary-types": "off",
          "@typescript-eslint/no-explicit-any": "warn",
        },
      },
    ],
  };