import { useContext, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Modal,
  Row,
  Stack,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import ReactSelect from "react-select";
import { ThemeContext } from "../App";
import styles from "./NoteList.module.css";
import { NoteType, TagType } from "../types";
import { useAuth } from "../hooks/useAuth";
import {
  Check2Circle,
  ExclamationLg,
  JournalText,
  PencilSquare,
} from "react-bootstrap-icons";
import { useAuthCheck } from "../hooks/useAuthCheck";

type NoteCardProps = {
  note: NoteType;
};

type NoteListProps = {
  availableTags: TagType[];
  notes: NoteType[];
  onUpdateTag: (id: string, label: string) => void;
  onDeleteTag: (id: string) => void;
  onSyncAll: () => void;
};

type EditTagsModalProps = {
  availableTags: TagType[];
  show: boolean;
  handleClose: () => void;
  onUpdate: (id: string, label: string) => void;
  onDelete: (id: string) => void;
};

export function NoteList({
  availableTags,
  notes,
  onUpdateTag,
  onDeleteTag,
  onSyncAll,
}: NoteListProps) {
  useAuthCheck();
  const [selectedTags, setSelectedTags] = useState<
    { id: string; label: string }[]
  >([]);
  const [title, setTitle] = useState("");
  const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false);
  const [mode] = useContext(ThemeContext);
  const { isAuth } = useAuth();

  //NOTE - Filtering functionality
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      return (
        (title === "" ||
          note.title.toLowerCase().includes(title.toLowerCase())) &&
        (selectedTags.length == 0 ||
          selectedTags.every((tag) =>
            note.tags.some((noteTag) => noteTag.id === tag.id)
          ))
      );
    });
  }, [title, selectedTags, notes]);

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1>Notes</h1>
        </Col>
        <Col xs="auto">
          <Stack gap={2} direction="horizontal">
            {isAuth && (
              <Button variant="outline-primary" onClick={() => onSyncAll()}>
                Sync All
              </Button>
            )}
            <Link to={"/new"}>
              <Button variant="primary">Create</Button>
            </Link>
            <Button
              variant="outline-secondary"
              onClick={() => setEditTagsModalIsOpen(true)}
            >
              <PencilSquare /> &nbsp; Local Tags
            </Button>
          </Stack>
        </Col>
      </Row>
      <Form>
        <Row className="mb-4">
          <Col>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="tags">
              <Form.Label>Tags</Form.Label>
              <ReactSelect
                styles={{
                  control: (base) => ({
                    ...base,
                    overflow: "hidden",
                    borderColor: mode === "dark" ? "#495057" : "#DEE2E6",
                  }),
                }}
                classNamePrefix={mode === "dark" ? "bg-dark text-white " : ""}
                value={selectedTags.map((tag) => {
                  return { label: tag.label, value: tag.id };
                })}
                options={availableTags.map((tag) => {
                  return {
                    ...tag,
                    label: tag.label,
                    value: tag.id,
                  };
                })}
                formatOptionLabel={(
                  data: { label: string; value: string } & Partial<TagType>
                ) => {
                  return (
                    <>
                      {data.label}
                      &nbsp;&nbsp;
                      {data.synced && (
                        <>
                          <Check2Circle className="text-success" /> &nbsp;&nbsp;
                        </>
                      )}
                    </>
                  );
                }}
                onChange={(tags) => {
                  setSelectedTags(
                    tags.map((tag) => {
                      return { ...tag, id: tag.value, label: tag.label };
                    })
                  );
                }}
                isMulti
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
        {notes.length > 0 ? (
          filteredNotes.map((note) => {
            return (
              <Col key={note.id}>
                <NoteCard note={note} />
              </Col>
            );
          })
        ) : (
          <div className="text-center mt-5 w-100">
            <JournalText fontSize="5rem" />
            <h3 className="my-5">No Notes Yet</h3>
            <p>
              <Link className="text-decoration-none" to={"/new"}>
                Create your first note!
              </Link>
            </p>
          </div>
        )}
      </Row>
      <EditTagsModal
        availableTags={availableTags}
        show={editTagsModalIsOpen}
        handleClose={() => setEditTagsModalIsOpen(false)}
        onUpdate={onUpdateTag}
        onDelete={onDeleteTag}
      />
    </>
  );
}

function NoteCard({ note }: NoteCardProps) {
  return (
    <Card
      as={Link}
      to={`/${note.id}`}
      className={`h-100 text-reset text-decoration-none ${styles.card}`}
    >
      <Card.Body>
        <Stack
          gap={2}
          className="h-100 align-items-center justify-content-center"
        >
          <span className="fs-5">{note.title}</span>
          <Stack
            direction="horizontal"
            gap={2}
            className="justify-content-center"
          >
            {note.tags.length > 0 && (
              <Stack
                gap={1}
                direction="horizontal"
                className="justify-content-center flex-wrap"
              >
                {note.tags.map((tag) => {
                  return (
                    <Badge key={tag.id} className="text-truncate">
                      {tag.label}
                    </Badge>
                  );
                })}
              </Stack>
            )}
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
          </Stack>
        </Stack>
      </Card.Body>
    </Card>
  );
}

function EditTagsModal({
  availableTags,
  show,
  handleClose,
  onUpdate,
  onDelete,
}: EditTagsModalProps) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Local Tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="w-100">
          <Stack gap={2}>
            {availableTags.map((tag) => {
              if (!tag.synced)
                return (
                  <Row key={tag.id}>
                    <Col>
                      <Form.Control
                        type="text"
                        value={tag.label}
                        onChange={(e) => onUpdate(tag.id, e.target.value)}
                      />
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="outline-danger"
                        onClick={() => onDelete(tag.id)}
                      >
                        &times;
                      </Button>
                    </Col>
                  </Row>
                );
            })}
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
