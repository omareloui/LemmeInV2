import type { User } from "./User";

export interface DehydratedUserHistory extends User {
  userId: string;
  isDisabled: boolean;
  version: number;
}

export interface UserHistory extends DehydratedUserHistory, Document {}
