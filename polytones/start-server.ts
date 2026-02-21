import * as express from "express";
import { exec } from "node:child_process";
import { Application, Request, Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MidiFile, saveSvg } from "./server/bridge.ts";

const app: Application = (
  express as unknown as { default: () => Application }
).default();
const port: number = 5173;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../midi_parser/dist");
const publicPath: string = path.resolve(process.cwd(), "public");

// app.use(express.json({ limit: "50mb" }));

app.get("/api/midi-file", MidiFile);
app.post("/api/save-svg", saveSvg);

app.use(express.static(distPath));
app.use(express.static(publicPath));

app.get(/.*/, (_: Request, res: Response): void => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.use((err: Error, _req: Request, res: Response): void => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: err.message });
});

app.listen(port, (): void => {
  const url = `http://localhost:${port}`;
  console.log(`\x1b[32m%s\x1b[0m`, `✔ Server active at ${url}`);

  const startCommand =
    process.platform === "win32"
      ? `start ${url}`
      : process.platform === "darwin"
        ? `open ${url}`
        : `xdg-open ${url}`;

  exec(startCommand);
});
