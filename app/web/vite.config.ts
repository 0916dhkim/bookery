import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

const MONOREPO_ROOT = path.resolve(__dirname, "../..");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: MONOREPO_ROOT,
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
});
