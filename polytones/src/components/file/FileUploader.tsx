import { useState, type ChangeEvent } from "react";
import { db } from "../../scripts/db";

type UploadStatus = "idle" | "uploading" | "completed" | "error";

function FileUploader() {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [stats, setStats] = useState({ added: 0, duplicates: 0 });

  async function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setStatus("uploading");
    let addedCount = 0;
    let duplicateCount = 0;
    const fileArray = Array.from(files);

    try {
      await Promise.all(
        fileArray.map(async (selectedFile) => {
          const existingFile = await db.MidiStorage.filter((record) => {
            return (
              record.file.name === selectedFile.name &&
              record.file.size === selectedFile.size
            );
          }).first();

          if (existingFile) {
            duplicateCount++;
          } else {
            await db.MidiStorage.add({ file: selectedFile });
            addedCount++;
          }
        }),
      );

      setStats({ added: addedCount, duplicates: duplicateCount });
      setStatus("completed");
      e.target.value = "";
    } catch (err) {
      console.error("Bulk upload failed:", err);
      setStatus("error");
    } finally {
      setTimeout(() => {
        setStatus("idle");
        setStats({ added: 0, duplicates: 0 });
      }, 5000);
    }
  }

  return (
    <form className="c-form">
      <div className="c-form__group">
        <input
          className="c-form__file"
          type="file"
          id="file"
          accept=".mid"
          disabled={status === "uploading"}
          onChange={handleFileInput}
          multiple
        />

        <div className="c-form__status">
          {status === "uploading" && (
            <p className="u-text-info">Uploading files...</p>
          )}

          {status === "completed" && (
            <div className="c-form__results">
              {stats.added > 0 && (
                <p className="u-text-success">
                  Successfully added {stats.added} file(s).
                </p>
              )}
              {stats.duplicates > 0 && (
                <p className="u-text-warning">
                  Skipped {stats.duplicates} duplicates.
                </p>
              )}
            </div>
          )}

          {status === "error" && (
            <p className="u-text-danger">An error occurred during upload.</p>
          )}
        </div>
      </div>
    </form>
  );
}

export default FileUploader;
