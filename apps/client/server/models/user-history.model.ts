import mongoose from "mongoose";
import type { DehydratedUserHistory } from "types";

const { Schema, model } = mongoose;

const UserHistorySchema = new Schema<DehydratedUserHistory>({
  userId: { type: String, required: true },
  isDisabled: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
});

export const UserHistory = model<DehydratedUserHistory>(
  "UserHistory",
  UserHistorySchema,
  "users-history",
);
