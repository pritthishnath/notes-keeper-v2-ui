import { RawNoteDataType, TagType } from "../types";
import { NoteForm } from "../components/NoteForm";

type NewNoteProps = {
  onSubmit: (data: RawNoteDataType) => void;
  onAddTag: (tag: TagType) => void;
  availableTags: TagType[];
};

export function NewNote({ onSubmit, onAddTag, availableTags }: NewNoteProps) {
  return (
    <>
      <h1>New Note</h1>
      <NoteForm
        onSubmit={onSubmit}
        onAddTag={onAddTag}
        availableTags={availableTags}
      />
    </>
  );
}
