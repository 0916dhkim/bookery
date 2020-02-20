const webpack = require("webpack");
const merge = require("webpack-merge");
const path = require("path");

/**
 * @type {boolean}
 * Ignore command-line argument `mode` and only consider environment variable `NODE_ENV`.
 */
const PRODUCTION = process.env.NODE_ENV === "production";

/** @type {import("webpack").Configuration} */
const baseConfig = {
  mode: PRODUCTION ? "production" : "development",
  devtool: PRODUCTION ? false : "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true,
              transpileOnly: !PRODUCTION // For fast development builds.
            }
          }
        ]
      }
    ]
  },
  output: {
    path: path.join(__dirname, "./dist")
  },
  plugins: []
};

// Settings specific to development mode.
if (!PRODUCTION) {
  baseConfig.devtool = "source-map";
  baseConfig.plugins.push(new webpack.ProgressPlugin());
}

/** @type {import("webpack").Configuration} */
const mainConfig = {
  entry: path.join(__dirname, "./src/electron.tsx"),
  target: "electron-main",
  output: {
    filename: "electron.js"
  }
};

/** @type {import("webpack").Configuration} */
const rendererConfig = {
  entry: path.join(__dirname, "./src/renderer.tsx"),
  target: "electron-renderer",
  output: {
    filename: "renderer.js"
  }
};

module.exports = [mainConfig, rendererConfig].map(config =>
  merge.smart(baseConfig, config)
);
