import type { Types } from "mongoose";

import { User } from "./User";
import { Tag } from "./Tag";

export interface DehydratedNote {
  user: Types.ObjectId;
  title?: string;
  body?: string;
  tags?: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  _id: string;
  title?: string;
  body?: string;
  tags?: Tag[];
  user: User;
}

export interface AddNote {
  body?: string;
  title?: string;
  tags?: string[];
}

export interface UpdateNote extends AddNote {
  id?: string;
}
