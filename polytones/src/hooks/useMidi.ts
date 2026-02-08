import { useEffect } from "react";
import { db } from "../scripts/db";

export function useMidi(refreshKey: number) {
  useEffect(() => {
    const loadMidiFromServer = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_MIDI);
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
  }, [refreshKey]);
}
