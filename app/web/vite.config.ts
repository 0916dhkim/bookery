import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

const MONOREPO_ROOT = path.resolve(__dirname, "../..");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: MONOREPO_ROOT,
});
