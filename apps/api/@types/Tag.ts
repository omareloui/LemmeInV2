import type { TagSchema } from "../models/index.ts";
import type { Doc } from "./index.ts";

export interface Tag extends Doc<TagSchema> {
  accountsCount?: number;
  notesCount?: number;
}

export interface CreateTagOptions {
  name: string;
  color: string;
}
