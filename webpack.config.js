const webpack = require("webpack");
const merge = require("webpack-merge");
const path = require("path");

/**
 * @type {boolean}
 * Ignore command-line argument `mode` and only consider environment variable `NODE_ENV`.
 */
const PRODUCTION = process.env.NODE_ENV === "production";

const OUTDIR = "dist/";

/** @type {import("webpack").Configuration} */
const baseConfig = {
  mode: PRODUCTION ? "production" : "development",
  devtool: PRODUCTION ? false : "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", "css"]
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
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: "url-loader"
      },
      {
        test: [/\.eot$/, /\.ttf$/, /\.svg$/, /\.woff$/, /\.woff2$/],
        loader: "file-loader"
      }
    ]
  },
  output: {
    path: path.resolve(OUTDIR),
    publicPath: OUTDIR
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
