import * as merge from "webpack-merge";
import { Configuration } from "webpack";
import * as path from "path";

/**
 * Ignore command-line argument `mode` and only consider environment variable `NODE_ENV`.
 */
const PRODUCTION: boolean = process.env.NODE_ENV === "production";

const baseConfig: Configuration = {
  mode: PRODUCTION ? "production" : "development",
  devtool: PRODUCTION ? false : "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: /src/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: !PRODUCTION // For fast development builds.
            }
          }
        ]
      }
    ]
  },
  output: {
    path: path.join(__dirname, "./dist")
  }
};

const mainConfig: Configuration = {
  entry: path.join(__dirname, "./src/electron.tsx"),
  target: "electron-main",
  output: {
    filename: "electron.js"
  }
};

const rendererConfig: Configuration = {
  entry: path.join(__dirname, "./src/renderer.tsx"),
  target: "electron-renderer",
  output: {
    filename: "renderer.js"
  }
};

export default [mainConfig, rendererConfig].map(config =>
  merge.smart(baseConfig, config)
);
