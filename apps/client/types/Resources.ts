import { Note } from "./Note";
import { Tag } from "./Tag";
import { Account } from "./Account";

export interface Resources {
  accounts: Account[];
  tags: Tag[];
  notes: Note[];
}
