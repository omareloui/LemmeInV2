import tagColor from "~~/config/tag-colors";

export type TagColor = typeof tagColor[number];

export interface AddTag {
  name: string;
  color?: TagColor;
}

export interface UpdateTag extends Required<AddTag> {
  id: string;
}

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  user: string;
  accountsCount: number;
}
