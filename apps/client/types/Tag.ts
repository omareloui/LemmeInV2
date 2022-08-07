import type { Types } from "mongoose";

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
