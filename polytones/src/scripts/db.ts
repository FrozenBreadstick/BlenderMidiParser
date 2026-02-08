import Dexie, { type Table } from "dexie";

export interface MidiFileRecord {
  id: number;
  fileData: ArrayBuffer | object;
  fileName: string;
}

export class MyDatabase extends Dexie {
  MidiStorage!: Table<MidiFileRecord>;

  constructor() {
    super("MidiLibrary");
    this.version(1).stores({
      MidiStorage: "id",
    });
  }
}

export const db = new MyDatabase();
