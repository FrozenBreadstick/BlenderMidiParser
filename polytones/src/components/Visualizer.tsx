import { type Midi } from "@tonejs/midi";

type File = {
  midi: Midi;
};

function Visualizer({ midi }: File) {
  console.log(midi);
  return <div className="c-visualizer"></div>;
}

export default Visualizer;
