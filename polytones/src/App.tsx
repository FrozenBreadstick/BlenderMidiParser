import "./styles/main.scss";
import { useEffect } from "react";
import { db } from "./scripts/db";
import { useLiveQuery } from "dexie-react-hooks";
import Visualizer from "./components/Visualizer";
import { Midi } from "@tonejs/midi";

function App() {
  const record = useLiveQuery(() => db.MidiStorage.get(1));

  useEffect(() => {
    const loadMidiFromServer = async () => {
      try {
        const response = await fetch("http://localhost:3000/");
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        await db.MidiStorage.put({
          id: 1,
          fileData: data.midi,
          fileName: data.filename || "unknown.mid",
        });
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    loadMidiFromServer();
  }, []);

  const midiObject = record ? new Midi(record.fileData as Uint8Array) : null;

  return (
    <section>
      <div className="c-input"></div>

      {midiObject ? (
        <Visualizer midi={midiObject} />
      ) : (
        <p>No MIDI loaded yet...</p>
      )}
    </section>
  );
}

export default App;
