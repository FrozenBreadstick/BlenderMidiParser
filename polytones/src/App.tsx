import MidiViewer from "./components/MidiViewer";
import "./styles/main.scss";

const midiFiles = import.meta.glob<Uint8Array>("../.cache/*.mid", {
  eager: true,
  query: "?uint8array",
  import: "default",
});

function App() {
  return (
    <section>
      <MidiViewer midiFiles={midiFiles} />
    </section>
  );
}

export default App;
