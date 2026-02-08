import { db } from "../scripts/db";
import { useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import VexFlow from "vexflow";

function Visualizer({ refreshKey }: { refreshKey: number }) {
  const midi = useLiveQuery(() => db.MidiStorage.get(1));
  const output = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!output.current || !midi) return;

    output.current.innerHTML = "";

    const { Factory } = VexFlow;

    const parentWidth = output.current.clientWidth;
    const parentHeight = output.current.clientHeight || 250;

    const vf = new Factory({
      renderer: {
        elementId: output.current.id,
        width: parentWidth,
        height: parentHeight,
      },
    });

    const score = vf.EasyScore();
    const system = vf.System({ width: parentWidth - 20, x: 10 });

    const firstTs = midi.midi.header.timeSignatures[0]?.timeSignature || [4, 4];
    const signature = `${firstTs[0]}/${firstTs[1]}`;
    const key = midi.midi.header.keySignatures[0]?.key || "C";

    midi.midi.tracks.forEach((track, index) => {
      system
        .addStave({
          voices: [
            score.voice(score.notes("C#5/q, B4, A4, G#4", { stem: "up" })),
            score.voice(score.notes("C#4/h, C#4", { stem: "down" })),
          ],
        })
        .addClef(index === 0 ? "treble" : "bass")
        .addKeySignature(key)
        .addTimeSignature(signature);
    });

    vf.draw();

    return () => {
      if (output.current) {
        output.current.innerHTML = "";
      }
    };
  }, [midi, refreshKey]);

  if (!midi) return <p>Loading MIDI data...</p>;

  return <div ref={output} className="c-visualizer" id="output"></div>;
}

export default Visualizer;
