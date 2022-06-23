import type { AccountSchema } from "../models/index.ts";
import type { Doc, Tag } from "./index.ts";

export interface Account extends Omit<Doc<AccountSchema>, "password" | "tags"> {
  tags?: Tag[];
  password: Account | string;
}

export interface CreateAccountOptions {
  app: string;
  password: string;
  isNative: boolean;
  accountIdentifier?: string;
  note?: string;
  site?: string;
  tags?: string[];
}

export type UpdateAccountOptions = Partial<
  CreateAccountOptions & { lastPasswordUpdate: Date; updatedAt: Date }
>;
