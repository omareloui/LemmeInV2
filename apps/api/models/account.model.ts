import db from "../db/db.ts";

export interface AccountSchema {
  _id: string;
  user: string;
  password: string;
  isNative: boolean; // AKA notOAuth
  app: string;
  accountIdentifier?: string;
  site?: string;
  note?: string;
  tags?: string[];
  lastUsed: Date | null;
  lastPasswordUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const Account = db.getDatabase.collection<AccountSchema>("accounts");
