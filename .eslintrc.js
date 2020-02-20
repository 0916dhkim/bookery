module.exports = {
  extends: ["eslint:recommended"],
  env: {
    es6: true,
  },
  overrides: [
    {
      files: ["webpack.config.js"],
      env: {
        node: true
      }
    },
    {
      files: ["**/*.ts", "**/*.tsx"],
      parser: "@typescript-eslint/parser",
      extends: [
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
          files: ["**/*.tsx"],
          env: {
            browser: true
          }
        }
      ]
    }
  ]
};
