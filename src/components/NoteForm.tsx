import { FormEvent, useContext, useRef, useState } from "react";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CreateableReactSelect from "react-select/creatable";
import { ThemeContext } from "../App";
import { NoteDataType, RawNoteDataType, TagType } from "../types";
import { v4 } from "uuid";
import { Check2Circle } from "react-bootstrap-icons";

type NoteFormProps = {
  onSubmit: (data: RawNoteDataType) => void;
  onAddTag: (tag: TagType) => void;
  availableTags: TagType[];
} & Partial<NoteDataType>;

export function NoteForm({
  onSubmit,
  onAddTag,
  availableTags,
  title = "",
  markdown = "",
  tags = [],
}: NoteFormProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  const [selectedTags, setSelectedTags] =
    useState<{ id: string; label: string }[]>(tags);
  const navigate = useNavigate();
  const [mode] = useContext(ThemeContext);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    onSubmit({
      title: titleRef.current!.value,
      markdown: markdownRef.current!.value,
      tagIds: selectedTags.map((tag) => tag.id),
    });

    navigate("..");
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Stack gap={4}>
        <Row>
          <Col>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control ref={titleRef} required defaultValue={title} />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="tags">
              <Form.Label>Tags</Form.Label>
              <CreateableReactSelect
                styles={{
                  control: (base) => ({
                    ...base,
                    overflow: "hidden",
                    borderColor: mode === "dark" ? "#495057" : "#DEE2E6",
                  }),
                }}
                classNamePrefix={mode === "dark" ? "bg-dark text-white " : ""}
                onCreateOption={(label) => {
                  const newTag = {
                    id: v4(),
                    label: label,
                    synced: false,
                  };

                  onAddTag(newTag);
                  setSelectedTags((prevTags) => [...prevTags, newTag]);
                }}
                value={selectedTags.map((tag) => {
                  return { label: tag.label, value: tag.id };
                })}
                options={availableTags.map((tag) => {
                  return { ...tag, label: tag.label, value: tag.id };
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
        <Form.Group controlId="markdown">
          <Form.Label>Body</Form.Label>
          <Form.Control
            ref={markdownRef}
            required
            as="textarea"
            rows={15}
            defaultValue={markdown}
          />
        </Form.Group>
        <Stack direction="horizontal" gap={2} className="justify-content-end">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Link to={".."}>
            <Button type="button" variant="outline-secondary">
              Cancel
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Form>
  );
}
