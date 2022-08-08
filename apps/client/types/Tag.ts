import type { Types } from "mongoose";

import { ClientUser } from "types";
import tagColor from "~~/config/tag-colors";

export type TagColor = typeof tagColor[number];

export interface AddTag {
  name: string;
  color?: TagColor | null;
}

export interface UpdateTag extends Required<AddTag> {
  id: string;
}

export interface DehydratedTag {
  name: string;
  color: TagColor;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag extends DehydratedTag {
  _id: Types.ObjectId;
  accountsCount?: number;
}

export interface ClientTag {
  _id: string;
  name: string;
  color: TagColor;
  user: ClientUser | string;
  createdAt: Date;
  updatedAt: Date;
  accountsCount?: number;
}
