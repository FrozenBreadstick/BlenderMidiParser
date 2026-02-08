import "./styles/main.scss";
import { useState } from "react";
import { useMidi } from "./hooks/useMidi";

import { db } from "./scripts/db";
import { useLiveQuery } from "dexie-react-hooks";

import Visualizer from "./components/Visualizer";

function App() {
  const midi = useLiveQuery(() => db.MidiStorage.get(1));

  const [refreshKey, setRefreshKey] = useState(0);
  useMidi(refreshKey);

  const handleUploadSuccess = () => setRefreshKey((prev) => prev + 1);
  return (
    <section>
      <div className="c-input">
        <button onClick={handleUploadSuccess}>Simulate New File Sync</button>
      </div>
      <Visualizer midi={midi?.midi} refreshKey={refreshKey} />
    </section>
  );
}

export default App;
