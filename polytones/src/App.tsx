import { useEffect, useState } from "react";
import MidiViewer from "./components/MidiViewer";

function App() {
  const [midiFiles, setMidiFiles] = useState<Record<string, Uint8Array>>({});

  useEffect(() => {
    async function syncBlenderMidis() {
      const list = await fetch("/api/midi-file").then((r) => r.json());

      if (list.length > 0) {
        const fileName = list[0];

        // Fix: Point to the /input/ subfolder
        const response = await fetch(`/input/${fileName}`);

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          setMidiFiles({
            [fileName]: new Uint8Array(buffer),
          });
        }
      }
    }
    syncBlenderMidis();
  }, []);

  return (
    <section>
      {Object.keys(midiFiles).length > 0 && (
        <MidiViewer midiFiles={midiFiles} />
      )}
    </section>
  );
}

export default App;
