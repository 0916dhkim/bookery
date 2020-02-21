module.exports = {
  extension: [
    "ts",
    "tsx"
  ],
  recursive: true,
  require: [
    "ts-node/register",
    "jsdom-global/register"
  ],
  colors: true,
  ui: "tdd"
}