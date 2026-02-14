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

        // Check how many pages the engine thinks it has created
        const pagesCount = await score.npages();
        let finalSvgAssembly = "";

        for (let i = 0; i < pagesCount; i++) {
          const pageSvg = await score.saveSvg(i);

          if (typeof pageSvg === "string") {
            if (i === 0) {
              // Keep the first page as is (includes the main headers/keys)
              finalSvgAssembly += pageSvg;
            } else {
              // For subsequent pages, we "strip" the header info or wrap them
              // so they overlap the previous page's bottom margin
              finalSvgAssembly += `<div class="subsequent-page">${pageSvg}</div>`;
            }
          }
        }

        setSvgContent(finalSvgAssembly);
        score.destroy();
      } catch (err) {
        console.error(err);
      }
    });
  }, [midiFiles]);

  return (
    <>
      {svgContent && (
        <div
          className="score-preview"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </>
  );
}

export default MidiViewer;
