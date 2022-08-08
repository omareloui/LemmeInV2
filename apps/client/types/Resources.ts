import {
  Note,
  Tag,
  Account,
  ClientNote,
  ClientTag,
  ClientAccount,
} from "types";

export interface Resources {
  accounts: Account<"Native" | "OAuthed">[];
  tags: Tag[];
  notes: Note[];
}

export interface ClientResources {
  accounts: ClientAccount<"Native" | "OAuthed">[];
  tags: ClientTag[];
  notes: ClientNote[];
}
