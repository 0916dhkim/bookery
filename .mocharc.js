module.exports = {
  extension: [
    "ts",
    "tsx"
  ],
  recursive: true,
  require: [
    "ts-node/register",
    "./test/helper"
  ]
}