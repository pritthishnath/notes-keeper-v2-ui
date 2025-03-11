import "bootstrap/dist/css/bootstrap.min.css";
import {
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { NewNote } from "../pages/NewNote";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";
import { useContext, useMemo } from "react";
import { v4 as uuidV4 } from "uuid";
import { NoteList } from "../pages/NoteList";
import { NoteLayout } from "../layouts/NoteLayout";
import { Note } from "../pages/Note";
import { EditNote } from "../pages/EditNote";
import { Github, MoonStarsFill, SunFill } from "react-bootstrap-icons";
import LoginView from "../pages/Login";
import RegisterView from "../pages/Register";
import { AuthLayout } from "../layouts/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import { ThemeContext } from "../App";
import {
  // NoteDataType,
  TagType,
  RawNoteType,
  NoteType,
  RawNoteDataType,
} from "../types";
import { useSyncStore } from "../hooks/useSyncStore";
import { AuthAPI, KeeperAPI } from "../utils/api-helper";
import { NoteReadOnly } from "../pages/NoteReadOnly";
import { useAuthCheck } from "../hooks/useAuthCheck";

function RootLayout() {
  useAuthCheck();
  const {
    data: fetchedNotes,
    setData: setNotes,
    fetchFromServer: fetchNotes,
    unsyncData: unsyncNotes,
  } = useSyncStore<RawNoteType & Partial<NoteType>>("NOTES", []);

  const {
    data: tags,
    setData: setTags,
    fetchFromServer: fetchTags,
  } = useSyncStore<TagType>("TAGS", []);

  const { isAuth } = useAuth();

  const navigate = useNavigate();

  const noteWithTags = useMemo(() => {
    return fetchedNotes.map((note) => {
      return {
        ...note,
        tags: tags.filter((tag) => note.tagIds.includes(tag.id)),
      };
    });
  }, [fetchedNotes, tags]);

  /**
   * NOTE: API functions
   */

  async function syncAll() {
    if (typeof isAuth !== "boolean") {
      try {
        const res = await KeeperAPI.NOTES.sync(
          { notes: noteWithTags },
          { userId: isAuth._id }
        );

        if (res.status === 200) {
          fetchNotes();
          fetchTags();
        }
      } catch (error) {
        console.error(error);
      }
    } else navigate("/auth");
  }

  async function syncNote(data: NoteType) {
    if (typeof isAuth !== "boolean") {
      try {
        const res = await KeeperAPI.NOTES.syncOne(data, { userId: isAuth._id });

        if (res.status === 200) {
          setNotes((prevNotes) => {
            return prevNotes.map((note) => {
              const updatedNote = {
                ...note,
                ...res.data,
              };

              if (note.id === data.id) {
                return updatedNote;
              } else {
                return note;
              }
            });
          });
        }
      } catch (error) {
        console.error(error);
      }
    } else navigate("/auth");
  }

  async function deleteNoteSync(id: string) {
    if (typeof isAuth !== "boolean") {
      try {
        const res = await KeeperAPI.NOTES.delete(id, { userId: isAuth._id });

        if (res.status === 200 || res.status === 204) {
          setNotes((prevNotes) => {
            return prevNotes.map((note) => {
              const updatedNote = {
                ...note,
                synced: false,
              };
              delete updatedNote._id;
              delete updatedNote.createdBy;

              if (note.id === id) {
                return updatedNote;
              } else {
                return note;
              }
            });
          });
        }
      } catch (error) {
        console.error(error);
      }
    } else navigate("/auth");
  }

  function noteUpdatedAtNow(id: string, link: string) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        const updatedNote = {
          ...note,
          updatedAt: new Date(),
        };
        link === ""
          ? delete updatedNote.permalink
          : (updatedNote.permalink = link);
        if (note.id === id) {
          return updatedNote;
        } else {
          return note;
        }
      });
    });
  }

  async function shareNote(data: NoteType) {
    if (typeof isAuth !== "boolean") {
      if (KeeperAPI.NOTES.share) {
        if (!data._id || data._id === "") {
          await syncNote(data);
          const resLink =
            KeeperAPI.NOTES.share &&
            (await KeeperAPI.NOTES.share(data.id, {
              userId: isAuth._id,
            }));

          resLink &&
            prompt("", `${window.origin}/shared/${resLink.data.permalink}`);
          noteUpdatedAtNow(data.id, resLink.data.permalink);
        } else {
          const resLink = await KeeperAPI.NOTES.share(data.id, {
            userId: isAuth._id,
          });

          prompt("", `${window.origin}/shared/${resLink.data.permalink}`);
          noteUpdatedAtNow(data.id, resLink.data.permalink);
        }
      }
    } else navigate("/auth");
  }

  async function revokeShareNote(id: string) {
    if (typeof isAuth !== "boolean") {
      if (KeeperAPI.NOTES.revokeSharing) {
        try {
          const res = await KeeperAPI.NOTES.revokeSharing(id, {
            userId: isAuth._id,
          });

          noteUpdatedAtNow(id, "");

          if (res.status === 200) {
            alert("Link Revoked");
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  /**
   * NOTE - Local storage CRUD functions
   */

  function onCreateNote({ ...data }: RawNoteDataType) {
    setNotes((prevNotes) => {
      const id = uuidV4();
      return [
        ...prevNotes,
        {
          ...data,
          id: id,
          synced: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          permalink: "",
        },
      ];
    });
  }

  function onUpdateNote(id: string, { ...data }: RawNoteDataType) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id) {
          return {
            ...note,
            ...data,
            synced: false,
            updatedAt: new Date(),
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

  function addTag(tag: TagType) {
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

  return (
    <Container>
      <Routes>
        <Route
          path="/"
          element={<RootLayoutElement unsyncNotes={unsyncNotes} />}
        >
          <Route
            index
            element={
              <NoteList
                notes={noteWithTags}
                availableTags={tags}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
                onSyncAll={syncAll}
              />
            }
          />
          <Route
            path="new"
            element={
              <NewNote
                onSubmit={onCreateNote}
                onAddTag={addTag}
                availableTags={tags}
              />
            }
          />
          <Route path=":id" element={<NoteLayout notes={noteWithTags} />}>
            <Route
              index
              element={
                <Note
                  onDelete={onDeleteNote}
                  onDeleteSync={deleteNoteSync}
                  onSync={syncNote}
                  onShare={shareNote}
                  onRevokeShare={revokeShareNote}
                />
              }
            />
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
          <Route path="shared">
            <Route path=":permalink" element={<NoteReadOnly />} />
          </Route>
          <Route path="auth" element={<AuthLayout />}>
            <Route index element={<LoginView />} />
            <Route path="register" element={<RegisterView />} />
          </Route>
          <Route path="*" element={<Navigate to={"/"} />} />
        </Route>
      </Routes>
    </Container>
  );
}

export default RootLayout;

function RootLayoutElement({ unsyncNotes }: { unsyncNotes: () => void }) {
  const { isAuth, logout, authUserLoading, authLoading } = useAuth();

  const [mode, setMode] = useContext(ThemeContext);

  function handleMode() {
    if (!mode) {
      setMode("dark");
    } else {
      setMode("");
    }
  }

  async function handleAuthClick() {
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    // const redirectUri = "https://login.pnath.in/auth/callback";

    const authUrl = `https://login.pnath.in?client_origin=${window.location.origin}`;

    const authWindow = window.open(
      authUrl,
      "Login",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    const handleMessage = async (event: MessageEvent) => {
      if (!event.origin || event.origin !== "http://login.pnath.in") {
        return;
      }
      if (event.data.status === "AUTH_SUCCESS") {
        const code = event.data.code;

        await AuthAPI.getToken(code);
        window.location.reload();
      }

      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      authWindow?.close();
    };

    window.addEventListener("message", handleMessage);
  }

  return (
    <>
      <Row className="my-3">
        <Col className="d-flex align-items-end">
          <Link to="/" className="text-decoration-none text-secondary">
            <h6>notes-keeper</h6>
          </Link>
          {typeof isAuth !== "boolean" && (
            <h6 className="badge bg-primary pointer ms-3">
              @{isAuth.username}
            </h6>
          )}
        </Col>
        <Col>
          <Stack gap={1} direction="horizontal" className="justify-content-end">
            {(authLoading || authUserLoading) && (
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
            {!isAuth ? (
              <div
                onClick={handleAuthClick}
                role="button"
                className="badge bg-primary pointer"
              >
                Login to Backup
              </div>
            ) : (
              <div
                role="button"
                className="badge bg-danger pointer"
                onClick={() => {
                  logout();
                  unsyncNotes();
                }}
              >
                Logout
              </div>
            )}
            <Button
              variant={mode === "dark" ? "dark" : "light"}
              onClick={handleMode}
            >
              {mode === "dark" ? <SunFill /> : <MoonStarsFill />}
            </Button>
            <Button
              variant={mode === "dark" ? "dark" : "light"}
              onClick={() => {
                window.open(
                  "https://github.com/pritthishnath/notes-keeper-v2-ui"
                );
              }}
            >
              <Github />
            </Button>
          </Stack>
        </Col>
      </Row>
      <Outlet />
    </>
  );
}
