import { Badge, Button, Col, Row, Stack } from "react-bootstrap";
import { useNote } from "../layouts/NoteLayout";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Check2Circle,
  ExclamationLg,
  Link45deg,
  PencilSquare,
  Trash,
} from "react-bootstrap-icons";
import { NoteType } from "../types";
import { useAuth } from "../hooks/useAuth";

type NoteProps = {
  onDelete: (id: string) => void;
  onDeleteSync: (id: string) => void;
  onSync: (data: NoteType) => void;
  onShare: (data: NoteType) => void;
  onRevokeShare: (id: string) => void;
};

export function Note({
  onDelete,
  onDeleteSync,
  onSync,
  onShare,
  onRevokeShare,
}: NoteProps) {
  const { isAuth } = useAuth();
  const note = useNote();
  const navigate = useNavigate();

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1>{note.title}</h1>
          {note.tags.length > 0 && (
            <Stack gap={1} direction="horizontal" className="flex-wrap">
              {note.tags.map((tag) => {
                return (
                  <Badge key={tag.id} className="text-truncate">
                    {tag.label}
                  </Badge>
                );
              })}
            </Stack>
          )}
        </Col>
        <Col xs="auto">
          <Stack gap={2} direction="horizontal">
            {note.synced ? (
              <div className="badge bg-success me-4">
                <Check2Circle /> synced
              </div>
            ) : (
              note._id &&
              note._id.length > 0 && (
                <div className="badge bg-warning me-4">
                  <ExclamationLg /> updated
                </div>
              )
            )}
            <Button variant="primary" onClick={() => onShare(note)}>
              Get <Link45deg />
            </Button>
            {typeof isAuth != "boolean" &&
              note.permalink &&
              note.permalink.length > 0 && (
                <Button
                  variant="outline-danger"
                  onClick={() => onRevokeShare(note.id)}
                >
                  Revoke <Link45deg />
                </Button>
              )}
            <Link to={`/${note.id}/edit`}>
              <Button variant="primary">
                <PencilSquare />
              </Button>
            </Link>
            {!note.synced && (
              <Button
                variant="outline-danger"
                onClick={() => {
                  onDelete(note.id);
                  navigate("/");
                }}
              >
                <Trash />
              </Button>
            )}
            {typeof isAuth != "boolean" && !note.synced && (
              <Button variant="outline-primary" onClick={() => onSync(note)}>
                Sync
              </Button>
            )}
            {typeof isAuth != "boolean" && note._id && note._id.length > 0 && (
              <Button
                variant="danger"
                onClick={() => {
                  onDeleteSync(note.id);
                }}
              >
                Delete Sync
              </Button>
            )}
            <Link to={`..`}>
              <Button variant="outline-secondary">Back</Button>
            </Link>
          </Stack>
        </Col>
      </Row>
      <ReactMarkdown>{note.markdown}</ReactMarkdown>
    </>
  );
}
