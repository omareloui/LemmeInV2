import mongoose from "mongoose";
import type { DehydratedTag } from "types";
import tagColors from "~~/config/tag-colors";

const { Schema, model } = mongoose;

const TagSchema = new Schema<DehydratedTag>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    color: { type: String, required: true, enum: tagColors },
  },
  { timestamps: true },
);

export const Tag = model<DehydratedTag>("Tag", TagSchema);
