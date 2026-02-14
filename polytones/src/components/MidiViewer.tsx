import WebMscore from "webmscore";
import { useEffect, useState } from "react";
import type { MidiViewerProps } from "../interfaces/interfaces";

function MidiViewer({ midiFiles }: MidiViewerProps) {
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    const buffers = Object.values(midiFiles);
    const midiBuffer = buffers.length > 0 ? buffers[0] : null;
    if (!midiBuffer) return;

    WebMscore.ready.then(async () => {
      try {
        const score = await WebMscore.load(
          "midi",
          midiBuffer.slice(0),
          [],
          false,
        );
        const pageCount = await score.npages();

        const pages: string[] = [];
        let currentY = 0; // cumulative vertical offset
        let maxWidth = 0;

        for (let i = 0; i < pageCount; i++) {
          let svgString = await score.saveSvg(i);
          if (typeof svgString !== "string") continue;

          svgString = svgString
            .replace(/<\?xml.*\?>/g, "")
            .replace(/<!DOCTYPE.*>/g, "");

          const parser = new DOMParser();
          const doc = parser.parseFromString(svgString, "image/svg+xml");
          const svg = doc.querySelector("svg");
          if (!svg) continue;

          // Remove instrument labels after first page
          if (i > 0) {
            svg.querySelectorAll("text").forEach((t) => {
              const content = t.textContent?.trim();
              if (content && /(El\.|Pno|Guit|Br|Sax)/.test(content)) t.remove();
            });
          }

          // Measure page width & height
          const viewBox = svg.getAttribute("viewBox");
          let width = 1000;
          let height = 700;
          if (viewBox) {
            const [, , w, h] = viewBox.split(" ").map(Number);
            width = w;
            height = h;
          }
          maxWidth = Math.max(maxWidth, width);

          // Wrap page content in <g> with proper vertical offset
          pages.push(
            `<g transform="translate(0, ${currentY})">${svg.innerHTML}</g>`,
          );

          // Update cumulative vertical offset for next page
          currentY += height;
        }

        // Combine all pages into one SVG
        const combinedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${maxWidth}" height="${currentY}">
          ${pages.join("")}
        </svg>`;

        setSvgContent(combinedSvg);

        // Save combined SVG for caching
        await fetch("/api/save-svg", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: "latest_score.svg",
            content: combinedSvg,
          }),
        });

        score.destroy();
      } catch (err) {
        console.error("WebMscore Error:", err);
      }
    });
  }, [midiFiles]);

  return (
    <div>
      {svgContent && <div dangerouslySetInnerHTML={{ __html: svgContent }} />}
    </div>
  );
}

export default MidiViewer;
