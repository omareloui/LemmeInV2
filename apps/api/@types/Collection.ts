import type { Document } from "../deps.ts";

import type { ReplaceProperty } from "./index.ts";

export type ID = Document | string;

export type CollectionDocument = { _id: ID };

export type CollectionFindOptions<T> = Partial<
  // deno-lint-ignore no-explicit-any
  Record<keyof T, string | RegExp | ID | { $in: Array<any> }>
>;

export type CollectionUpdateOptions<T> = Partial<Omit<T, "_id">>;

export type Doc<T extends CollectionDocument> = ReplaceProperty<T, "_id", "id">;

export type FindReturn<T extends CollectionDocument> = Promise<Doc<T>[]>;
export type FindOneReturn<T extends CollectionDocument> = Promise<
  Doc<T> | undefined
>;
export type CreateReturn<T extends CollectionDocument> = Promise<Doc<T>>;
export type UpdateReturn<T extends CollectionDocument> = FindOneReturn<T>;
export type DeleteReturn = Promise<void>;
export type DropReturn = Promise<void>;
