module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  overrides: [
    {
      files: ["configs/**/*.ts"],
      extends: ["eslint:recommended"],
      env: {
        node: true
      }
    },
    {
      files: ["src/**/*.tsx"],
      env: {
        browser: true
      }
    }
  ]
};
