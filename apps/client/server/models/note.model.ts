import mongoose from "mongoose";
import type { DehydratedNote } from "types";

const { Schema, model } = mongoose;

const NoteSchema = new Schema<DehydratedNote>(
  {
    user: { type: Schema.Types.ObjectId, required: true },
    title: { type: String },
    body: { type: String },
    tags: { type: [Schema.Types.ObjectId], ref: "Tag" },
  },
  { timestamps: true },
);

export const Note = model<DehydratedNote>("Note", NoteSchema);
