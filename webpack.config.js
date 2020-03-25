const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

const isDevelopment = process.env.NODE_ENV !== "production";
const devServerPort = process.env.WEBPACK_WDS_PORT || 9080;

/** @type {import("webpack").Configuration} */
const baseConf = {
  mode: isDevelopment ? "development" : "production",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [{ loader: "ts-loader" }]
      },
      {
        test: /\.(eot|png|svg|ttf|woff|woff2)$/,
        use: ["file-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: {
    extensions: [".json", ".js", ".jsx", ".ts", ".tsx"]
  },
  devtool: isDevelopment ? "eval-source-map" : false,
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: process.env.NODE_ENV || "development",
      WEBPACK_WDS_PORT: devServerPort
    })
  ]
};

/** @type {import("webpack").Configuration} */
const mainConf = {
  name: "main",
  entry: {
    main: "./src/main/index.tsx"
  },
  output: {
    path: path.resolve(__dirname, "dist/main"),
    filename: "[name].js"
  },
  target: "electron-main"
};

/** @type {import("webpack").Configuration} */
const rendererConf = {
  name: "renderer",
  entry: {
    renderer: "./src/renderer/index.tsx"
  },
  output: {
    path: path.resolve(__dirname, "dist/renderer"),
    filename: "[name].js"
  },
  target: "electron-renderer",
  plugins: [
    new HtmlWebpackPlugin({
      template: "static/index.html"
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, "static"),
    contentBasePublicPath: "/static/",
    publicPath: "/dist/renderer/",
    port: devServerPort
  }
};

/** @type {import("webpack").Configuration} */
const testConf = {
  name: "test",
  entry: {
    test: "./src/test.js"
  },
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist/test"),
    filename: "[name].js"
  },
  externals: [nodeExternals()]
};

module.exports = [mainConf, rendererConf, testConf].map(conf =>
  merge.smart(baseConf, conf)
);
