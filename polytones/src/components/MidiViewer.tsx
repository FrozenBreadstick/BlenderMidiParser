import { useEffect, useRef } from "react";
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import WebMscore from "webmscore";
import type { MidiViewerProps } from "../interfaces/interfaces";

function MidiViewer({ midiFiles }: MidiViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const renderScore = async () => {
      const midiData = Object.values(midiFiles)[0];

      if (
        !midiData ||
        midiData.length < 4 ||
        !containerRef.current ||
        isProcessing.current
      )
        return;

      const isMidi =
        midiData[0] === 0x4d &&
        midiData[1] === 0x54 &&
        midiData[2] === 0x68 &&
        midiData[3] === 0x64;
      if (!isMidi) return;

      isProcessing.current = true;

      try {
        if (!osmdRef.current) {
          osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
            autoResize: false,
            backend: "svg",
            drawPartNames: false,
          });
        }
        const osmd = osmdRef.current;

        await WebMscore.ready;
        if (!isMounted) return;

        const score = await WebMscore.load("midi", midiData);
        const musicXml = await score.saveXml();

        score.destroy();

        if (!isMounted) return;

        osmd.setOptions({
          pageFormat: "Endless",
          drawingParameters: "compact",
          drawTitle: false,
        });

        await osmd.load(musicXml);
        osmd.render();

        const svgElement = containerRef.current.querySelector("svg");
        if (svgElement && isMounted) {
          const content = new XMLSerializer().serializeToString(svgElement);
          const finalSvg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n${content}`;

          await fetch("/api/save-svg", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: "latest_score.svg",
              content: finalSvg,
            }),
          });
        }
      } catch (err) {
        console.error("MidiViewer Error:", err);
      } finally {
        isProcessing.current = false;
      }
    };

    renderScore();

    return () => {
      isMounted = false;
    };
  }, [midiFiles]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "auto",
        background: "#fff",
      }}
    />
  );
}

export default MidiViewer;
