import db from "../db/db.ts";
import type { UserSchema } from "./user.model.ts";

export interface UserHistorySchema extends UserSchema {
  userId: string;
  isDisabled: boolean;
  version: number;
}

export const UserHistory =
  db.getDatabase.collection<UserHistorySchema>("users-history");
