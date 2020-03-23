module.exports = {
  spec: "src/**/*.spec.*",
  recursive: true,
  require: [
    "ts-node/register",
    "jsdom-global/register"
  ],
  colors: true,
  ui: "tdd"
}