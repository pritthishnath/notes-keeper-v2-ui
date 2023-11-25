import { Badge, Col, Row, Stack } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { NoteType } from "../types";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { KeeperAPI } from "../utils/api-helper";

export function NoteReadOnly() {
  const { permalink } = useParams();

  const [note, setNote] = useState<Partial<NoteType>>();

  useEffect(() => {
    getNote();
  }, [permalink]);

  async function getNote() {
    try {
      const res = await KeeperAPI.NOTES.fetchShared(permalink as string);

      if (res.status === 200) {
        setNote(res.data);
      }
    } catch (error) {
      setNote({
        title: "404 Not Found",
        markdown: "Please check the URL again!",
      });
    }
  }

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1>{note?.title}</h1>
          {note?.tags && note.tags.length > 0 && (
            <Stack gap={1} direction="horizontal" className="flex-wrap">
              {note?.tags.map((tag) => {
                return (
                  <Badge key={tag.id} className="text-truncate">
                    {tag.label}
                  </Badge>
                );
              })}
            </Stack>
          )}
        </Col>
      </Row>
      <ReactMarkdown>{note?.markdown}</ReactMarkdown>
    </>
  );
}
