import baseConfig from "./webpack.config.base";
import * as merge from "webpack-merge";
import { Configuration } from "webpack";
import * as path from "path";

const mainConfig: Configuration = {
  entry: path.join(__dirname, "../src/electron.tsx"),
  target: "electron-main",
  output: {
    filename: "electron.js"
  }
};

const rendererConfig: Configuration = {
  entry: path.join(__dirname, "../src/renderer.tsx"),
  target: "electron-renderer",
  output: {
    filename: "renderer.js"
  }
};

export default [mainConfig, rendererConfig].map(config =>
  merge.smart(baseConfig, config)
);
