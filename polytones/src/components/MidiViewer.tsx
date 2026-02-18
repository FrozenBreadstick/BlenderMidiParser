import { useEffect, useRef } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import WebMscore from "webmscore";
import type { MidiViewerProps } from "../interfaces/interfaces";

function MidiViewer({ midiFiles }: MidiViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    const convertAndRender = async () => {
      if (isProcessing.current) return;

      const midiData = Object.values(midiFiles)[0];
      if (!midiData || !containerRef.current) return;

      isProcessing.current = true;

      try {
        if (!osmdRef.current) {
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: false,
            backend: "svg",
            drawPartNames: false,
            renderSingleHorizontalStaffline: true,
          });
        }
        const osmd = osmdRef.current;

        await WebMscore.ready;

        const score = await WebMscore.load("midi", new Uint8Array(midiData));
        const musicXml = await score.saveXml();

        await osmd.load(musicXml);

        osmd.setCustomPageFormat(1000000, 1000000);

        osmd.setOptions({
          renderSingleHorizontalStaffline: true,
          drawTitle: false,
          drawingParameters: "compact",
        });

        osmd.render();

        if (containerRef.current) {
          // 1. Find the actual SVG element inside the OSMD container
          const svgElement = containerRef.current.querySelector("svg");

          if (!svgElement) {
            throw new Error("SVG element not found in OSMD container.");
          }

          // 2. Serialize only the SVG and its children
          const svgContent = new XMLSerializer().serializeToString(svgElement);

          // 3. Add the XML declaration so Blender recognizes it
          const xmlHeader =
            '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
          const finalContent = xmlHeader + svgContent;

          // 4. Send the clean SVG string
          await fetch("/api/save-svg", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: "converted_midi.svg",
              content: finalContent,
            }),
          });
        }

        score.destroy();
      } catch (err) {
        console.error("Worker or OSMD Error:", err);
      } finally {
        isProcessing.current = false;
      }
    };

    convertAndRender();
  }, [midiFiles]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "#fff",
      }}
    />
  );
}

export default MidiViewer;
