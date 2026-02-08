import { type ReactNode } from "react";
import { db } from "../../scripts/db";
import { Trash } from "react-bootstrap-icons";

interface FileWrapperProps {
  children?: ReactNode;
}

function FileWrapper({ children }: FileWrapperProps) {
  async function handleDelete() {
    const message =
      "Are you sure you want to delete all data? This cannot be undone.";

    if (!window.confirm(message)) return;

    await db.delete();
    window.location.reload();
  }
  return (
    <section className="c-files">
      <div className="c-files__header">
        <h1>Your files</h1>
        <Trash className="c-icon c-icon--trash" onClick={handleDelete} />
      </div>

      {children}
    </section>
  );
}

export default FileWrapper;
