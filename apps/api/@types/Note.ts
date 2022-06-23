import type { NoteSchema } from "../models/index.ts";
import type { Doc, Tag } from "./index.ts";

export interface Note extends Omit<Doc<NoteSchema>, "tags"> {
  tags?: Tag[];
}

export interface UpdateNoteOptions extends Partial<CreateNoteOptions> {
  updatedAt?: Date;
}

export interface CreateNoteOptions {
  body?: string;
  title?: string;
  tags?: string[];
}
