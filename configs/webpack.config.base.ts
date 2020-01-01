import { Configuration } from "webpack";
import * as path from "path";

const config: Configuration = {
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
    path: path.join(__dirname, "../dist")
  }
};

export default config;
