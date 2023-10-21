import "bootstrap/dist/css/bootstrap.min.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { NewNote } from "./pages/NewNote";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import { createContext, useMemo } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { v4 as uuidV4 } from "uuid";
import { NoteList } from "./pages/NoteList";
import { NoteLayout } from "./layouts/NoteLayout";
import { Note } from "./pages/Note";
import { EditNote } from "./pages/EditNote";
import { Github, MoonStarsFill, SunFill } from "react-bootstrap-icons";

export type Note = {
  id: string;
} & NoteData;

export type RawNote = {
  id: string;
} & RawNoteData;

export type RawNoteData = {
  title: string;
  markdown: string;
  tagIds: string[];
};

export type NoteData = {
  title: string;
  markdown: string;
  tags: Tag[];
};

export type Tag = {
  id: string;
  label: string;
};

export const ThemeContext = createContext<string>("");

function App() {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", []);
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", []);

  const noteWithTags = useMemo(() => {
    return notes.map((note) => {
      return {
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      };
    });
  }, [notes, tags]);

  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return [
        ...prevNotes,
        { ...data, id: uuidV4(), tagIds: tags.map((tag) => tag.id) },
      ];
    });
  }

  function onUpdateNote(id: string, { tags, ...data }: NoteData) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            ...data,
            tagIds: tags.map((tag) => tag.id),
          };
        } else {
          return note;
        }
      });
    });
  }

  function onDeleteNote(id: string) {
    setNotes((prevNotes) => {
      return prevNotes.filter((note) => note.id !== id);
    });
  }

  function addTag(tag: Tag) {
    setTags((prevTags) => [...prevTags, tag]);
  }

  function updateTag(id: string, label: string) {
    setTags((prevTags) => {
      return prevTags.map((tag) => {
        if (tag.id === id) {
          return { ...tag, label };
        } else {
          return tag;
        }
      });
    });
  }

  function deleteTag(id: string) {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
  }

  const [mode, setMode] = useLocalStorage("MODE", "");

  function handleMode() {
    if (!mode) {
      setMode("dark");
    } else {
      setMode("");
    }
  }

  return (
    <ThemeContext.Provider value={mode}>
      <Container>
        <Row className="my-3">
          <Col></Col>
          <Col>
            <Stack
              gap={1}
              direction="horizontal"
              className="justify-content-end"
            >
              <Button
                variant={mode === "dark" ? "dark" : "light"}
                onClick={handleMode}
              >
                {mode === "dark" ? <SunFill /> : <MoonStarsFill />}
              </Button>
              <Button
                variant={mode === "dark" ? "dark" : "light"}
                onClick={() => {
                  window.open("https://github.com/pritthishnath/notes-keeper");
                }}
              >
                <Github />
              </Button>
            </Stack>
          </Col>
        </Row>
        <Routes>
          <Route
            path="/"
            element={
              <NoteList
                notes={noteWithTags}
                availableTags={tags}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
              />
            }
          />
          <Route
            path="/new"
            element={
              <NewNote
                onSubmit={onCreateNote}
                onAddTag={addTag}
                availableTags={tags}
              />
            }
          />
          <Route path="/:id" element={<NoteLayout notes={noteWithTags} />}>
            <Route index element={<Note onDelete={onDeleteNote} />} />
            <Route
              path="edit"
              element={
                <EditNote
                  onSubmit={onUpdateNote}
                  onAddTag={addTag}
                  availableTags={tags}
                />
              }
            />
          </Route>
          <Route path="*" element={<Navigate to={"/"} />} />
        </Routes>
      </Container>
    </ThemeContext.Provider>
  );
}

export default App;
