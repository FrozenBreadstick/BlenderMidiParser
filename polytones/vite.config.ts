import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import arraybuffer from "vite-plugin-arraybuffer";
import fs from "node:fs";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },

  build: {
    outDir: "../midi_parser",
    emptyOutDir: true,
  },
  plugins: [
    react(),
    arraybuffer(),
    {
      name: "save-svg-plugin",
      configureServer(server) {
        server.middlewares.use("/api/save-svg", (req, res) => {
          if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk;
            });
            req.on("end", () => {
              const { fileName, content } = JSON.parse(body);
              const targetDir = path.resolve(__dirname, "./.cache");

              if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

              fs.writeFileSync(path.join(targetDir, fileName), content);
              res.end("Saved successfully");
            });
          }
        });
      },
    },
  ],
});
