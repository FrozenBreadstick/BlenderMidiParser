import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const inputDir = path.join(projectRoot, "public", "input");
const outputDir = path.join(projectRoot, "public", "output");

[inputDir, outputDir].forEach((dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const MidiFile = (_: Request, res: Response): void => {
  try {
    const files: string[] = fs
      .readdirSync(inputDir)
      .filter((f: string) => f.match(/\.(mid|midi)$/i));

    res.json(files);
  } catch (err: unknown) {
    console.error("Failed to read input directory", err);
    res.status(500).json({ error: "Failed to read input directory" });
  }
};

interface SvgBody {
  fileName: string;
  content: string;
}

export const saveSvg = (req: Request, res: Response): void => {
  try {
    const { fileName, content } = req.body as SvgBody;

    if (!fileName || !content) {
      res.status(400).send("Missing fileName or content");
      return;
    }

    const fullPath = path.join(outputDir, fileName);
    fs.writeFileSync(fullPath, content);

    console.log(`\x1b[36m%s\x1b[0m`, `✔ File written to: ${fullPath}`);

    res.send("Saved successfully");
  } catch (err: unknown) {
    console.error("Error saving SVG:", err);
    res.status(500).send("Error saving SVG");
  }
};
