const ESBuild = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

ESBuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  outfile: "dist/index.js",
  sourcemap: true,
  plugins: [
    copy({
      assets: {
        from: [
          "node_modules/@bookery/database/src/__generated__/schema.prisma",
          "node_modules/@bookery/database/src/__generated__/*.node",
        ],
        to: ".",
      },
    }),
  ],
});
