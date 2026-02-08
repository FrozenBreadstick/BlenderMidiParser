import "./styles/main.scss";
import { useEffect } from "react";
import { db } from "./scripts/db";
import Visualizer from "./components/Visualizer";

function App() {
  useEffect(() => {
    const loadMidiFromServer = async () => {
      try {
        const response = await fetch("http://localhost:3000/");
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        await db.MidiStorage.put({
          id: 1,
          midi: data.midi,
        });
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    loadMidiFromServer();
  }, []);

  return (
    <section>
      <div className="c-input"></div>

      <Visualizer />
    </section>
  );
}

export default App;
