import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import arraybuffer from "vite-plugin-arraybuffer";

export default defineConfig({
  css: {
    postcss: { plugins: [autoprefixer] },
  },
  build: {
    outDir: "../midi_parser/dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
  plugins: [react(), arraybuffer()],
});
