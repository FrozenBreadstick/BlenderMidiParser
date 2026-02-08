import { Trash } from "react-bootstrap-icons";
import { type MidiFileRecord, db } from "../../scripts/db";
import {
  useFileDate,
  useFileSize,
  useFileType,
  useFileTitle,
} from "../../hooks";

interface FileProps {
  file: MidiFileRecord;
  isActive: boolean;
  onSelect: (id: number | undefined) => void;
}

function File({ file, isActive, onSelect }: FileProps) {
  const { name, lastModified, size, type } = file.file;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await db.MidiStorage.delete(file.id);
      } catch (error) {
        console.error("Failed to delete MIDI file:", error);
      }
    }
  };

  return (
    <div
      className={`c-file ${isActive ? "c-file--active" : ""}`}
      onClick={() => onSelect(file.id)}
    >
      <div className="c-file__info">
        <p className="c-file__title">{useFileTitle(name)}</p>
        <div className="c-file__data">
          <p>{useFileDate(lastModified)}</p>
          <p>{useFileSize(size)}</p>
          <p>{useFileType(type)}</p>
        </div>
      </div>

      <Trash className="c-icon c-icon--trash" onClick={handleDelete} />
    </div>
  );
}

export default File;
