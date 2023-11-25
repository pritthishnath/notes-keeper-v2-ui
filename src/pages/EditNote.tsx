import { RawNoteDataType, TagType } from "../types";
import { NoteForm } from "../components/NoteForm";
import { useNote } from "../layouts/NoteLayout";

type EditNoteProps = {
  onSubmit: (id: string, data: RawNoteDataType) => void;
  onAddTag: (tag: TagType) => void;
  availableTags: TagType[];
};

export function EditNote({ onSubmit, onAddTag, availableTags }: EditNoteProps) {
  const note = useNote();
  return (
    <>
      <h1>Edit Note</h1>
      <NoteForm
        title={note.title}
        markdown={note.markdown}
        tags={note.tags}
        onSubmit={(data: RawNoteDataType) => onSubmit(note.id, data)}
        onAddTag={onAddTag}
        availableTags={availableTags}
      />
    </>
  );
}
