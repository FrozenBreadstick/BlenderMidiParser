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
          true,
        );
        const pageCount = await score.npages(); // total pages
        console.log("Total pages:", pageCount);

        const pages: string[] = [];

        for (let i = 0; i < pageCount; i++) {
          const svg = await score.saveSvg(i); // page index: 0-based
          pages.push(svg);
        }

        // Combine or render all pages
        setSvgContent(pages.join('<div class="page-separator"></div>'));
        score.destroy();
      } catch (err) {
        console.error("WebMscore Error:", err);
      }
    });
  }, [midiFiles]);
  return (
    <section>
      {svgContent && (
        <div
          className="score-preview"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </section>
  );
}
export default MidiViewer;
