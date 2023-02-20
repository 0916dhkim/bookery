const ESBuild = require("esbuild");

ESBuild.buildSync({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/index.js",
});
