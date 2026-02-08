import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/main.scss";

import { db } from "./scripts/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Container, Row, Col } from "react-bootstrap";
import { FileUploader, FileWrapper, File } from "./components/file";
import { useState } from "react";

function App() {
  const [active, setActive] = useState<number | undefined>(undefined);
  const midiFiles = useLiveQuery(() => db.MidiStorage.toArray(), []);
  function isSelected(id: number | undefined) {
    if (id) {
      setActive(id);
    }
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col md={4}>
          <FileWrapper>
            <div className="u-flex u-scroll">
              {midiFiles?.map((file, index) => {
                const isActive = active === file.id;
                return (
                  <File
                    key={index}
                    file={file}
                    isActive={isActive}
                    onSelect={() => isSelected(file.id)}
                  />
                );
              })}
            </div>
            <FileUploader />
          </FileWrapper>
        </Col>
        <Col md={8}>
          <section className="c-visualizer"></section>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
