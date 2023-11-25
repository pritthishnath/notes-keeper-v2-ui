export type NoteType = {
  id: string;
  _id?: string;
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
  permalink?: string;
  createdBy?: string;
  noteIds?: string[];
} & NoteDataType;

export type RawNoteType = {
  id: string;
  _id?: string;
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
  permalink?: string;
  createdBy?: string;
} & RawNoteDataType;

export type RawNoteDataType = {
  title: string;
  markdown: string;
  tagIds: string[];
};

export type NoteDataType = {
  title: string;
  markdown: string;
  tags: TagType[];
};

export type TagType = {
  id: string;
  label: string;
  synced: boolean;
  _id?: string;
};

export type AuthUserType = {
  _id: string;
  name: string;
  username: string;
  email: string;
};

export type AuthContextStateType = {
  isAuth: boolean | AuthUserType;
  authLoading: boolean;
  authUserLoading: boolean;
};

export type IncomingErrorResponseDataType = {
  error: boolean;
  msg: string;
  errorData: object;
};
