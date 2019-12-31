module.exports = {
  entry: "./src/electron.tsx",
  mode: "development",
  target: "electron-main",
  devtool: "inline-source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: /src/,
        use: [{ loader: "ts-loader" }]
      }
    ]
  },
  output: {
    path: __dirname + "/dist",
    filename: "electron.js"
  }
};
