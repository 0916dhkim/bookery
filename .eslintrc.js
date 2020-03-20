module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:prettier/recommended"
  ],
  env: {
    node: true,
    es6: true,
  },
  plugins: ["react-hooks"],
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error"
  },
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      extends: [
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
      ],
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module"
      },
      rules: {
        "no-dupe-class-members": "off"
      },
      overrides: [
        {
          files: ["**/*.tsx"],
          env: {
            browser: true
          }
        }
      ]
    }
  ],
  settings: {
    react: {
      version: "detect"
    }
  }
};
