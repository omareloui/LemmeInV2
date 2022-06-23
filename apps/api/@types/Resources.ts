import { Account, Tag, Note } from "./index.ts";

export interface Resources {
  accounts: Account[];
  tags: Tag[];
  notes: Note[];
}
