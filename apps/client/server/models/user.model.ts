import mongoose from "mongoose";
import type { DehydratedUser } from "types";

import { roles } from "server/config";

const { Schema, model } = mongoose;

const UserSchema = new Schema<DehydratedUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isValidEmail: { type: Boolean, default: false },
    role: { type: String, enum: roles },
  },
  { timestamps: true },
);

export const User = model<DehydratedUser>("User", UserSchema);
