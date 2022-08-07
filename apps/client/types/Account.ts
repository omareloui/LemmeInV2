import type { Types } from "mongoose";

import type { User } from "./User";
import type { Tag } from "./Tag";

export interface DehydratedAccount<
  TKind extends "Native" | "OAuthed" | undefined = undefined,
> {
  user: Types.ObjectId;
  password: TKind extends "Native"
    ? string
    : TKind extends "OAuthed"
    ? Types.ObjectId
    : never;
  app: string;
  accountIdentifier?: string;
  site?: string;
  note?: string;
  tags?: Types.ObjectId[];
  lastUsed: Date | null;
  lastPasswordUpdate: Date;
  kind?: TKind;
}

export type Account<
  TKind extends "Native" | "OAuthed" | undefined = undefined,
> = {
  _id: Types.ObjectId;
  user: User;
  password: TKind extends "Native"
    ? string
    : TKind extends "OAuthed"
    ? Account<"Native">
    : never;
  app: string;
  accountIdentifier?: string;
  site?: string;
  note?: string;
  tags?: Tag[];
  lastUsed: Date | null;
  lastPasswordUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
  kind?: TKind;
};

// export interface AddAccountReceivedData {
//   app: string;
//   password: { value: string; isNative: boolean };
//   accountIdentifier?: string;
//   site?: string;
//   note?: string;
//   tags?: string[];
// }

// export interface AddAccount {
//   app: string;
//   password: string;
//   isNative: boolean;
//   accountIdentifier?: string;
//   site?: string;
//   note?: string;
//   tags?: string[];
// }

// export interface UpdateAccount {
//   id: string;
//   app: string;
//   password: string;
//   isNative: boolean;
//   accountIdentifier?: string;
//   site?: string;
//   note?: string;
//   tags?: string[];
// }

// export type PasswordStrengthIDs = 0 | 1 | 2 | 3;
// export type PasswordDiversity = "lowercase" | "uppercase" | "symbol" | "number";
// export type PasswordStrengthValues = "compromised" | "weak" | "okay" | "safe";
// export type PasswordStrengthColors =
//   | "--clr-danger"
//   | "--clr-warn"
//   | "--clr-safe";

// export interface PasswordScore {
//   score: number;
//   maxScore: number;
//   percentage: number;
//   suggestions: string[];
//   diversity: PasswordDiversity[];
//   value: PasswordStrengthValues;
//   color: PasswordStrengthColors;
//   length: number;
// }

// export interface PasswordStrength extends PasswordScore {
//   contains: PasswordDiversity[];
//   length: number;
// }
